import {
  Users,
  ImageIcon,
  FileQuestion,
  Star,
  Folder,
  MessageCircle,
} from "lucide-react";
import { useAppContext } from "../Central_Store/app_context.jsx";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { fetchedData } = useAppContext();
  const navigate = useNavigate();

  const stats = useMemo(
    () => [
      {
        title: "Influencers",
        key: "influencers",
        count: fetchedData.influencers?.length || 0,
        icon: <Users size={26} />,
        color: "#940aea",
        bg: "#940aea20",
        to: "/dashboard/influencers",
      },
      {
        title: "Banners",
        key: "banners",
        count: fetchedData.banners?.length || 0,
        icon: <ImageIcon size={26} />,
        color: "#940aea",
        bg: "#940aea20",
        to: "/dashboard/banners",
      },
      {
        title: "Admin Data",
        key: "adminData",
        count: fetchedData.adminData?.length || 0,
        icon: <FileQuestion size={26} />,
        color: "#940aea",
        bg: "#940aea20",
        to: "/dashboard/admin-data",
      },
      {
        title: "Categories",
        key: "categories",
        count: fetchedData.categories?.length || 0,
        icon: <Folder size={26} />,
        color: "#940aea",
        bg: "#940aea20",
        to: "/dashboard/categories",
      },
      {
        title: "Users",
        key: "users",
        count: fetchedData.users?.length || 0,
        icon: <Users size={26} />,
        color: "#940aea",
        bg: "#940aea20",
        to: "/dashboard/users",
      },
      {
        title: "Sponsored Content",
        key: "sponsoredContent",
        count: fetchedData.sponsoredContent?.length || 0,
        icon: <Star size={26} />,
        color: "#940aea",
        bg: "#940aea20",
        to: "/dashboard/sponsored-content",
      },
      {
        title: "Reviews",
        key: "reviews",
        count: fetchedData.reviews?.length || 0,
        icon: <MessageCircle size={26} />,
        color: "#940aea",
        bg: "#940aea20",
        to: "/dashboard/reviews",
      },
    ],
    [fetchedData]
  );

  return (
    <div className="">
      <h1 className="text-center text-3xl font-bold text-[#ff237c]">
        Dashboard Overview
      </h1>

      <p className="text-center text-gray-600 mt-1 mb-6">
        Welcome back! Here's your website analytics overview.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => item.to && navigate(item.to)}
            className="flex items-center justify-between w-full text-left p-5 bg-white rounded-md shadow border border-gray-200 hover:shadow-md hover:border-[#ff237c] transition cursor-pointer"
          >
            <div>
              <p className="text-gray-700 text-md">{item.title}</p>
              <p className="text-2xl font-bold mt-1">{item.count}</p>
            </div>

            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: item.bg, color: item.color }}
            >
              {item.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
