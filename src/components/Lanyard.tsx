import classnames from "classnames";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { Client } from "tdl";
import { TDLib } from "tdl-tdlib-addon"; // اگر نیاز به باینری داری، از prebuilt استفاده کن

// تنظیمات - جای این‌ها رو با مقادیر خودت پر کن
const API_ID = 23835670; // api_id از my.telegram.org
const API_HASH = " 4ef2ce9e9ef89e5377e95c043264fc41"; // api_hash از my.telegram.org
const USER_ID = 360273138; // آیدی عددی کاربر هدف (مثلاً خودت برای تست)

export const Status: FC = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let client: Client | null = null;

    const initClient = async () => {
      try {
        // ایجاد کلاینت TDL
        const tdlib = new TDLib(); // یا از prebuilt استفاده کن
        client = new Client(tdlib, {
          apiId: API_ID,
          apiHash: API_HASH,
          databaseDirectory: "./tdlib", // فولدر برای ذخیره session
          filesDirectory: "./files",
          verbosityLevel: 1, // برای لاگ کمتر
        });

        // دریافت وضعیت کاربر
        const user = await client.invoke({
          _: "getUser",
          user_id: USER_ID,
        });

        // پردازش status
        let userStatus: string;
        if (user.status._ === "userStatusOnline") {
          userStatus = "online";
        } else if (user.status._ === "userStatusOffline") {
          userStatus = "offline";
        } else if (user.status._ === "userStatusRecently") {
          userStatus = "recently";
        } else if (user.status._ === "userStatusLastWeek") {
          userStatus = "last week";
        } else if (user.status._ === "userStatusLastMonth") {
          userStatus = "last month";
        } else {
          userStatus = "unknown";
        }

        setStatus(userStatus);
      } catch (error) {
        console.error("Error fetching status:", error);
        setStatus("offline");
      } finally {
        setLoading(false);
      }
    };

    initClient();

    // cleanup
    return () => {
      if (client) {
        client.destroy();
      }
    };
  }, []);

  // تابع getColor (همون قبلی)
  const getColor = () => {
    switch (status) {
      case "online":
        return { status: "online", color: "bg-green-500" };
      case "recently":
        return { status: "recently seen", color: "bg-yellow-500" };
      case "last week":
        return { status: "last seen within a week", color: "bg-orange-500" };
      case "last month":
        return { status: "last seen within a month", color: "bg-red-500" };
      default:
        return { status: "offline", color: "bg-gray-500 dark:bg-gray-200" };
    }
  };

  // تابع getStatus (همون قبلی، با تنظیمات جدید)
  const getStatus = () => {
    if (loading) return "loading...";
    if (!status) return "offline";
    return getColor().status;
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