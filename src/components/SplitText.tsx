/**
 * SplitText Component
 * 
 * یک کامپوننت React که متن را به حروف جداگانه تقسیم می‌کند و با انیمیشن نمایش می‌دهد.
 * هر حرف با تاخیر مشخصی انیمیت می‌شود و می‌تواند هنگام ورود به viewport فعال شود.
 * 
 * @example
 * ```tsx
 * <SplitText 
 *   text="سلام دنیا" 
 *   delay={50}
 *   onLetterAnimationComplete={() => console.log('انیمیشن کامل شد')}
 * />
 * ```
 * 
 * @source Inspired by https://reactbits.dev/ts/tailwind/
 */

import { animated, useSprings, type SpringConfig } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";

interface SplitTextProps {
	/** متن مورد نظر برای نمایش انیمیشن‌دار */
	text?: string;
	/** کلاس‌های CSS اضافی برای استایل دهی */
	className?: string;
	/** تاخیر بین انیمیشن هر حرف (بر حسب میلی‌ثانیه) */
	delay?: number;
	/** استایل اولیه انیمیشن (قبل از نمایش) */
	animationFrom?: { opacity: number; transform: string };
	/** استایل نهایی انیمیشن (بعد از نمایش) */
	animationTo?: { opacity: number; transform: string };
	/** تابع easing برای کنترل منحنی انیمیشن */
	easing?: SpringConfig["easing"];
	/** آستانه مشاهده برای Intersection Observer (0 تا 1) */
	threshold?: number;
	/** حاشیه root برای Intersection Observer */
	rootMargin?: string;
	/** ترازبندی متن */
	textAlign?: "left" | "right" | "center" | "justify" | "start" | "end";
	/** تابعی که بعد از تکمیل انیمیشن تمام حروف فراخوانی می‌شود */
	onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
	text = "",
	className = "",
	delay = 100,
	animationFrom = { opacity: 0, transform: "translate3d(0,40px,0)" },
	animationTo = { opacity: 1, transform: "translate3d(0,0,0)" },
	easing = (t: number) => t,
	threshold = 0.1,
	rootMargin = "-100px",
	textAlign = "center",
	onLetterAnimationComplete,
}) => {
	// تقسیم متن به کلمات و سپس به حروف جداگانه
	const words = text.split(" ").map((word) => word.split(""));
	const letters = words.flat();
	
	// مدیریت وضعیت مشاهده شدن کامپوننت در viewport
	const [inView, setInView] = useState(false);
	const ref = useRef<HTMLParagraphElement>(null);
	const animatedCount = useRef(0);

	// استفاده از Intersection Observer برای تشخیص ورود کامپوننت به viewport
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					// بعد از فعال شدن، دیگر نیازی به مشاهده نیست
					if (ref.current) {
						observer.unobserve(ref.current);
					}
				}
			},
			{ threshold, rootMargin },
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, [threshold, rootMargin]);

	// ایجاد انیمیشن برای هر حرف با استفاده از react-spring
	const springs = useSprings(
		letters.length,
		letters.map((_, i) => ({
			from: animationFrom,
			to: inView
				? async (
						next: (props: {
							opacity: number;
							transform: string;
						}) => Promise<void>,
					) => {
						await next(animationTo);
						animatedCount.current += 1;
						// فراخوانی callback بعد از تکمیل انیمیشن آخرین حرف
						if (
							animatedCount.current === letters.length &&
							onLetterAnimationComplete
						) {
							onLetterAnimationComplete();
						}
					}
				: animationFrom,
			delay: i * delay, // تاخیر انیمیشن برای هر حرف
			config: { easing },
		})),
	);

	return (
		<p
			ref={ref}
			className={`split-parent inline overflow-hidden ${className}`}
			style={{ textAlign, whiteSpace: "normal", wordWrap: "break-word" }}
		>
			{words.map((word, wordIndex) => (
				<span
					key={wordIndex}
					style={{ display: "inline-block", whiteSpace: "nowrap" }}
				>
					{word.map((letter, letterIndex) => {
						// محاسبه ایندکس حرف در آرایه کل حروف
						const index =
							words
								.slice(0, wordIndex)
								.reduce((acc, w) => acc + w.length, 0) +
							letterIndex;

						return (
							<animated.span
								key={index}
								style={
									springs[
										index
									] as unknown as React.CSSProperties
								}
								className="inline-block transform transition-opacity will-change-transform"
							>
								{letter}
							</animated.span>
						);
					})}
					{/* فاصله بین کلمات */}
					<span style={{ display: "inline-block", width: "0.3em" }}>
						&nbsp;
					</span>
				</span>
			))}
		</p>
	);
};

export default SplitText;
