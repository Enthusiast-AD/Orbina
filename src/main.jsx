import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { Provider } from "react-redux"
import store from "./store/store.js"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Home from "./pages/Home.jsx"
import { AuthLayout, Login } from "./components/index.js"
import AddPost from "./pages/AddPost"
import Signup from "./pages/Signup"
import EditPost from "./pages/EditPost"
import Post from "./pages/Post"
import AllPosts from "./pages/AllPosts"
import Profile from "./pages/Profile.jsx"
import EditProfile from "./pages/EditProfile.jsx"
import UserProfile from "./pages/UserProfile.jsx"
import Messages from "./pages/Messages.jsx"
import NotFound from "./pages/NotFound.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        ),
      },
      {
        path: "/all-posts",
        element: (
          <AuthLayout authentication>
            <AllPosts />
          </AuthLayout>
        ),
      },
      {
        path: "/add-post",
        element: (
          <AuthLayout authentication>
            <AddPost />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-post/:slug",
        element: (
          <AuthLayout authentication>
            <EditPost />
          </AuthLayout>
        ),
      },
      {
        path: "/post/:slug",
        element: <Post />,
      },
      {
        path: "/profile",
        element: (
          <AuthLayout authentication>
            <Profile />
          </AuthLayout>
        ),
      },
      {
        path: "/profile/:userId",
        element: <UserProfile />,
      },
      {
        path: "/edit-profile",
        element: (
          <AuthLayout authentication>
            <EditProfile />
          </AuthLayout>
        ),
      },
      {
        path: "/messages",
        element: (
          <AuthLayout authentication>
            <Messages />
          </AuthLayout>
        ),
      },
      {
        path: "/messages/:userId",
        element: (
          <AuthLayout authentication>
            <Messages />
          </AuthLayout>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)