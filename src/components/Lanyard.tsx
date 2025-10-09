import classnames from "classnames";
import type { FC } from "react";
import { useEffect, useState } from "react";

// تنظیمات اولیه
const TELEGRAM_BOT_TOKEN = "8274938896:AAF40S6bLWZVnsptzbu84S28v1vapl6g3Eo"; // توکن ربات تلگرام
const USER_ID = "360273138"; // آیدی عددی کاربر تلگرام

export const Status: FC = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  // دریافت وضعیت کاربر از تلگرام
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // فرض می‌کنیم از API تلگرام استفاده می‌کنیم
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${USER_ID}`
        );
        const data = await response.json();

        if (data.ok) {
          // بررسی وضعیت کاربر
          const userStatus = data.result.status; // این فرضی است، تلگرام مستقیماً اینو نمیده
          setStatus(userStatus || "offline");
        } else {
          setStatus("offline");
        }
      } catch (error) {
        console.error("Error fetching Telegram status:", error);
        setStatus("offline");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  // تنظیم رنگ و متن وضعیت
  const getColor = () => {
    switch (status) {
      case "online":
        return {
          status: "online",
          color: "bg-green-500",
        };
      case "offline":
        return {
          status: "offline",
          color: "bg-gray-500 dark:bg-gray-200",
        };
      case "recently":
        return {
          status: "recently seen",
          color: "bg-yellow-500",
        };
      case "last_seen_week":
        return {
          status: "last seen within a week",
          color: "bg-orange-500",
        };
      default:
        return {
          status: "unknown",
          color: "bg-gray-500 dark:bg-gray-200",
        };
    }
  };

  // تنظیم متن وضعیت
  const getStatus = () => {
    if (loading || !status) return "loading...";

    switch (status) {
      case "online":
        return "online";
      case "offline":
        return "offline";
      case "recently":
        return "recently seen";
      case "last_seen_week":
        return "last seen within a week";
      default:
        return "unknown";
    }
  };

  return (
    <span className="mb-4 flex items-center space-x-2 rounded-md text-gray-700 dark:text-gray-300">
      <span
        title={getColor().status}
        className={classnames(
          "h-3",
          "w-3",
          "rounded-full",
          "flex-shrink-0",
          getColor().color
        )}
      />
      <span className="truncate text-sm" title={getStatus()}>
        {getStatus()}
      </span>
    </span>
  );
};