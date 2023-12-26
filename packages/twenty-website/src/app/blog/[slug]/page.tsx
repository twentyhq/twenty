export default async function BlogPost({ params }: { params: { slug: string } }) {
    const posts = {};
    return <>Blog Post: {params.slug}</>;
}
