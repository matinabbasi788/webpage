import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	try {
		// Fetch both status and avatar data
		const [statusResponse, avatarResponse] = await Promise.all([
			fetch("https://check.m4t1n.ir/telegram/", {
				method: "GET",
				headers: {
					"Accept": "application/json",
				},
			}),
			fetch("https://check.m4t1n.ir/telegram/avatar.php", {
				method: "GET",
				headers: {
					"Accept": "application/json",
				},
			}),
		]);

		if (!statusResponse.ok) {
			return new Response(
				JSON.stringify({ error: "Failed to fetch from Telegram API" }),
				{
					status: statusResponse.status,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const statusData = await statusResponse.json();
		let avatarData = null;
		
		// Try to get avatar data if available
		if (avatarResponse.ok) {
			try {
				avatarData = await avatarResponse.json();
			} catch {
				// Avatar API might fail, continue without it
			}
		}

		// Merge the data
		const mergedData = {
			...statusData,
			profile_image: avatarData?.profile_image || null,
			profile_url: avatarData?.profile_url || `https://t.me/matinabbasi788`,
		};
		
		return new Response(JSON.stringify(mergedData), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=30",
			},
		});
	} catch (error) {
		console.error("Error in Telegram API route:", error);
		return new Response(
			JSON.stringify({ error: "Internal server error" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}
};

