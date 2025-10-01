import LandingPage from "@/components/landing-page";

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/lessons`, {
    cache: "no-store",
  });

  let lessons = [];
  if (response.ok) {
    const data = await response.json();
    lessons = data.lessons || [];
  } else {
    console.error("Error fetching lessons:", response.statusText);
  }

  return <LandingPage initialLessons={lessons} />;
}
