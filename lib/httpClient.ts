import useSWR, { SWRConfiguration,MutatorOptions } from 'swr';
import useSWRMutation from 'swr/mutation';
import * as Sentry from '@sentry/nextjs';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';

interface SendRequestParams {
  arg: any;
}

interface OptionsSWRParams  extends MutatorOptions {
  headers?: AxiosHeaders; 
  onError?: (error: any, key: string, config: any) => void;
}

const axiosInstance: AxiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    Sentry.captureException(error);

    return Promise.reject(error);
  }
);

export const axiosFetcher = async (url: string, options?: AxiosRequestConfig) => {
  try {
    const response = await axiosInstance(url, options);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getDefaultHeaders = (headers: any = {}) => {
  return {
    'authorization': `Bearer ${process.env.NEXT_PUBLIC_TOKEN_API}`,
    ...headers,
  };
};

const HttpClient = (url: string, optionsFetcher: AxiosRequestConfig = {}, optionsSWR: SWRConfiguration = {}) => {
  const headers = getDefaultHeaders(optionsFetcher.headers);

  const newOptionsFetcher: AxiosRequestConfig = {
    ...optionsFetcher,
    headers,
  };

  const { data, error, ...rest } = useSWR(url, () => axiosFetcher(url, newOptionsFetcher), {
    ...optionsSWR,
    revalidateOnFocus: false,
    timeout: 10000,
    onError: (error, key, config) => {
      if (optionsSWR.onError) {
        optionsSWR.onError(error, key, config);
      }
    },
  });

  return { data, error, ...rest };
};

async function sendRequest(params: [string, any], { arg }: SendRequestParams) {
  const [url, headers] = params;
  const response = await axiosInstance.post(url, { ...arg }, { headers });

  return response.data;
}

export const HttpClientMutate = (url: string, optionsSWR: OptionsSWRParams = {}) => {
  // only for post method

  const headers = {
    ...getDefaultHeaders(optionsSWR.headers),
    'Content-Type': 'application/json',
    'X-Request-Id': new Date().valueOf().toString(),
  };

  const { trigger, isMutating } = useSWRMutation([url, headers], sendRequest, {
    onError: (error, key, config) => {
      if (optionsSWR.onError) {
        optionsSWR.onError(error, key, config);
      }
    },
    ...optionsSWR,
  });

  return { trigger, isMutating };
};

export default HttpClient;