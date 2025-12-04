import classnames from "classnames";
import type { FC } from "react";
import { useEffect, useState } from "react";

interface TelegramData {
	bio: string;
	status: string;
	last_seen_utc: string;
	last_seen_tehran: string;
	profile_image?: string | null;
	profile_url?: string;
}

export const Status: FC = () => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<TelegramData | null>(null);
	const [error, setError] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [fallbackError, setFallbackError] = useState(false);

	useEffect(() => {
		const fetchTelegramData = async () => {
			try {
				setError(false);
				const response = await fetch("/api/telegram", {
					method: "GET",
					headers: {
						"Accept": "application/json",
					},
				});
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				
				const json = await response.json();
				
				// Validate that we got the expected data
				if (json && typeof json === "object") {
					setData(json);
					setError(false);
				} else {
					throw new Error("Invalid response format");
				}
			} catch (err) {
				console.error("Error fetching Telegram data:", err);
				setError(true);
				setData(null);
			} finally {
				setLoading(false);
			}
		};

		fetchTelegramData();
		// Refresh every 30 seconds
		const interval = setInterval(fetchTelegramData, 30000);
		return () => clearInterval(interval);
	}, []);

	const getStatusColor = () => {
		if (!data) return "bg-gray-400 dark:bg-gray-500";
		switch (data.status) {
			case "online":
				return "bg-emerald-500 dark:bg-emerald-400";
			case "offline":
				return "bg-gray-400 dark:bg-gray-500";
			default:
				return "bg-gray-400 dark:bg-gray-500";
		}
	};

	const formatLastSeen = (dateString: string) => {
		if (!dateString) return "";
		try {
			// Parse the date string (format: "2025-12-05 00:41:07" in Tehran time)
			// Convert to a format that JavaScript can parse
			const date = new Date(dateString.replace(" ", "T") + "+03:30");
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();
			const diffMins = Math.floor(diffMs / 60000);
			const diffHours = Math.floor(diffMs / 3600000);
			const diffDays = Math.floor(diffMs / 86400000);

			if (diffMins < 1) return "just now";
			if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
			if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
			if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
			});
		} catch {
			// If parsing fails, return a simplified version
			return dateString.split(" ")[0];
		}
	};

	if (loading) {
		return (
			<div className="mb-4 flex items-center space-x-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 border border-blue-200/50 dark:border-blue-800/30 shadow-sm">
				<div className="relative">
					<div className="h-4 w-4 rounded-full bg-blue-400 dark:bg-blue-500 animate-pulse" />
					<div className="absolute inset-0 h-4 w-4 rounded-full bg-blue-400 dark:bg-blue-500 animate-ping opacity-75" />
				</div>
				<span className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">
					loading telegram status...
				</span>
			</div>
		);
	}

	if (error || (!loading && !data)) {
		return (
			<div className="mb-4 space-y-2">
				<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
					<div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
						<svg
							className="w-4 h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="text-sm font-medium">Telegram status unavailable</span>
					</div>
					<p className="text-xs text-red-600 dark:text-red-500 mt-1 ml-6">
						Unable to fetch data from API. Please check the console for details.
					</p>
				</div>
			</div>
		);
	}

	if (!data) {
		return null;
	}

	return (
		<div className="mb-4 space-y-3">
			{/* Status Card */}
			<div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 border border-blue-200/60 dark:border-blue-800/40 shadow-sm hover:shadow-md transition-all duration-300">
				{/* Decorative gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				
				<div className="relative flex items-center space-x-3 mb-3">
					{/* Profile Image with beautiful 3D effect */}
					<div className="relative flex items-center justify-center group">
						{/* Animated glow effect */}
						<div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 animate-pulse transition-opacity duration-300" />
						
						{!fallbackError ? (
							/* Beautiful Profile Image with 3D effect */
							<div 
								className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:scale-110 group"
								style={{
									transform: 'perspective(1000px) rotateY(-8deg) rotateX(8deg)',
									boxShadow: '0 20px 60px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
								}}
							>
								{/* Gradient overlay for depth */}
								<div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 z-10" />
								
								{/* Profile image with fallback to avatar.jpg */}
								<img
									src={data.profile_image || "/avatar.jpg"}
									alt="Telegram Profile"
									className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
									onError={() => {
										if (data.profile_image) {
											// If API image fails, try fallback to avatar.jpg
											setImageError(true);
										} else {
											// If avatar.jpg also fails, show icon
											setFallbackError(true);
										}
									}}
								/>
								
								{/* Shine effect on hover */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20" />
							</div>
						) : (
							/* Fallback: 3D Telegram Icon Container (only if both API image and avatar.jpg fail) */
							<div 
								className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
								style={{
									transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
									boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
								}}
							>
								{/* Inner highlight */}
								<div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
								
								{/* Telegram plane icon */}
								<svg
									className="absolute inset-0 w-full h-full p-3 text-white drop-shadow-lg"
									fill="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.018.297-.075 1.78-1.158 3.573-.89 1.36-1.25 1.84-2.04 2.95-.28.38-.59.76-.85 1.01-.27.26-.5.44-.69.58a3.5 3.5 0 0 1-.5.3c-.2.1-.4.17-.58.2-.36.05-.7.03-1.01-.08-.31-.1-.7-.3-1.2-.6-.5-.3-1.05-.7-1.68-1.23-.63-.54-1.24-1.18-1.8-1.9-.56-.72-1.05-1.5-1.47-2.3-.42-.8-.75-1.6-1-2.38-.25-.78-.4-1.5-.48-2.15-.08-.65-.08-1.2 0-1.65.08-.45.22-.8.42-1.05.2-.25.48-.38.82-.38.34 0 .75.15 1.23.45.48.3 1.05.75 1.7 1.35.65.6 1.35 1.3 2.1 2.1.75.8 1.5 1.6 2.25 2.4.75.8 1.45 1.5 2.1 2.1.65.6 1.2 1.05 1.65 1.35.45.3.75.45.9.45z"/>
								</svg>
								
								{/* 3D depth effect */}
								<div className="absolute inset-0 rounded-full border border-white/30" />
							</div>
						)}
					</div>
					<div className="flex items-center space-x-2.5 flex-1">
						<div className="relative">
							<span
								title={data.status}
								className={classnames(
									"h-3.5",
									"w-3.5",
									"rounded-full",
									"flex-shrink-0",
									"ring-2 ring-white dark:ring-gray-800",
									"shadow-sm",
									getStatusColor(),
								)}
							/>
						</div>
						{data.status === "online" ? (
							<div className="relative inline-block">
								{/* Subtle animated green glow around "Online" text */}
								<span className="relative text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize tracking-wide px-2.5 py-0.5 rounded-md">
									<span className="absolute inset-0 rounded-md bg-emerald-500/10 animate-pulse" />
									<span 
										className="absolute inset-0 rounded-md border border-emerald-500/40 animate-ping"
										style={{
											animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
										}}
									/>
									<span className="relative z-10 text-emerald-600 dark:text-emerald-400 font-semibold">
										Online
									</span>
								</span>
							</div>
						) : (
							<span className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize tracking-wide">
								Offline
							</span>
						)}
					</div>
				</div>

				{/* Last Seen */}
				{data.status === "offline" && data.last_seen_tehran && (
					<div className="relative mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-800/30">
						<div className="flex items-start space-x-3">
							<div className="mt-0.5 p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 flex items-center justify-center">
								<span className="text-xl">🕐</span>
							</div>
							<div className="flex-1 space-y-1.5">
								<div className="text-sm font-medium text-gray-700 dark:text-gray-200">
									Last seen: <span className="text-blue-600 dark:text-blue-400">{formatLastSeen(data.last_seen_tehran)}</span>
								</div>
								<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
									<div className="text-gray-500 dark:text-gray-400">
										<span className="font-medium">Tehran:</span> {data.last_seen_tehran}
									</div>
									<div className="text-gray-500 dark:text-gray-400">
										<span className="font-medium">UTC:</span> {data.last_seen_utc}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Send Message Button */}
				{data.profile_url && (
					<div className="relative mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-800/30">
						<a
							href={data.profile_url}
							target="_blank"
							rel="noopener noreferrer"
							className="group/btn relative flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
						>
							{/* Animated background gradient */}
							<div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
							
							{/* Shine effect */}
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
							
							{/* Icon */}
							<svg
								className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							
							{/* Text */}
							<span className="relative z-10">Send Message</span>
							
							{/* Arrow icon */}
							<svg
								className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					</div>
				)}
			</div>

			{/* Bio */}
			{data.bio && (
				<div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30 p-4 border border-purple-200/60 dark:border-purple-800/40 shadow-sm hover:shadow-md transition-all duration-300">
					{/* Decorative gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					
					<div className="relative flex items-start space-x-3">
						<div className="mt-0.5 p-2 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 flex items-center justify-center">
							<span className="text-2xl">💬</span>
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 uppercase tracking-wider">
								Bio
							</div>
							<p className="text-sm text-gray-800 dark:text-gray-100 italic leading-relaxed font-medium">
								"{data.bio}"
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

