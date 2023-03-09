import Head from 'next/head'
import { useState } from "react"
import httpClient, {
  HttpClientMutate,
  axiosFetcher,
  getDefaultHeaders,
} from "../lib/httpClient"

const MainPage = () => {
  const [inputValue, setInputValue] = useState("")
  const { data, error, isLoading, mutate } = httpClient(
    `https://api.todoist.com/rest/v2/tasks?project_id=2309273807`
  )

  const { trigger, isMutating } = HttpClientMutate(
    "https://api.todoist.com/rest/v2/tasks"
  )

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    try {
      e.preventDefault()
      await trigger({ content: inputValue, project_id: 2309273807 })
      setInputValue("")
      mutate()
    } catch (error) {
      console.log("error from handleSubmit", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await axiosFetcher(`https://api.todoist.com/rest/v2/tasks/${id}`, {
        method: "DELETE",
        headers: getDefaultHeaders(),
      })
      mutate()
    } catch (error) {
      console.log("error from handleSubmit", error)
    }
  }

  const handleCompleted = async (id: string) => {
    try {
      await axiosFetcher(`https://api.todoist.com/rest/v2/tasks/${id}/close`, {
        method: "POST",
        headers: getDefaultHeaders(),
      })
      mutate()
    } catch (error) {
      console.log("error from handleSubmit", error)
    }
  }

  return (
    <div>
      <Head>
        <title>To do apps</title>
        <meta property="og:title" content="To do apps" key="to-do" />
      </Head>
      <div className="bg-gray-50 flex flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          To-Do List
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border-b-2 border-teal-500 py-2">
            <input
              className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Add Todo"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 text-sm text-white py-1 px-2 rounded"
              type="submit"
              disabled={isMutating}
            >
              {isMutating ? (
                <svg
                  className="animate-spin h-4 w-4 text-white inline-block mr-2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm12 0a8 8 0 100-16 8 8 0 000 16z"
                  ></path>
                </svg>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {isLoading ? (
            <div className="flex items-center justify-center mt-8">
              <svg
                className="animate-spin h-8 w-8 text-teal-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm12 0a8 8 0 100-16 8 8 0 000 16z"
                ></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-8">
              Failed to load data.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 mt-8">
              {data.map((todo: any) => (
                <li
                  key={todo.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      id={`todo-${todo.id}`}
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-teal-600"
                      checked={todo.completed}
                      onChange={() => handleCompleted(todo.id)}
                    />
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={`ml-3 ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      {todo.content}
                    </label>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-600"
                    disabled={isMutating}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainPage
