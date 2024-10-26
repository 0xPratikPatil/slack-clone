import { authMiddleware } from "better-auth/next-js";
import { NextResponse } from "next/server";

export default authMiddleware({
	customRedirect: async (session, request) => {
		const baseURL = request.nextUrl.origin;
		if (request.nextUrl.pathname === "/login" && session) {
			return NextResponse.redirect(new URL("/dashboard", baseURL));
		}
		if (request.nextUrl.pathname === "/register" && session) {
			return NextResponse.redirect(new URL("/dashboard", baseURL));
		}
		if (request.nextUrl.pathname === "/dashboard" && !session) {
			return NextResponse.redirect(new URL("/login", baseURL));
		}
		return NextResponse.next();
	},
});

export const config = {
	matcher: ["/dashboard", "/login","/register"],
};
