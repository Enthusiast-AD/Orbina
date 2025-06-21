import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    // const [file,setFile] = useState(null)
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    // const getFile = () => {
    //     appwriteService.getFile()
    // }

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex justify-between mb-4 relative border-0 rounded-xl p-2">
                    <img
                        src={appwriteService.getFileView(post.featuredImage)}
                        alt={post.title}
                        className="w-150  object-cover rounded-xl shadow-lg"
                    />

                    {isAuthor && (
                        <div className="absolute right-6 top-6">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button bgColor="bg-green-500" className="mr-3 hover:bg-green-600 active:bg-green-700 cursor-pointer">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-500" onClick={deletePost} className="hover:bg-red-600 active:bg-red-700 cursor-pointer">
                                Delete
                            </Button>
                        </div>
                    )}
                <div className="w-full mb-6 ml-6 bg-gray-800 text-white p-4 rounded-xl ">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                <div className="browser-css mt-4">
                    {parse(post.content)}
                </div>
                </div>
                </div>
            </Container>
        </div>
    ) : null;
}