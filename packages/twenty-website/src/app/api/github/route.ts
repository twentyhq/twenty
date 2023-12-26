import {NextRequest, NextResponse} from "next/server";

export async function GET (request: NextRequest){
    const response = await fetch('https://api.github.com/repos/twentyhq/twenty/releases');
    const data = await response.json();
  
    return NextResponse.json(data);
}