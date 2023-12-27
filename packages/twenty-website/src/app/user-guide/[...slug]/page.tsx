import { getPost } from "@/app/user-guide/get-posts";

export default async function BlogPost({ params }: { params: { slug: string[] } }) {
    const post = await getPost(params.slug as string[]);
    console.log(post);

    return <div>
        <h1>{post?.itemInfo.title}</h1>
    <div>{post?.content}</div>
    </div>;
}
