"use client";

import { useState } from "react";
import Header from "@/app/lms-main/components/Header";
import CategoryCard from "@/app/lms-main/components/CategoryCard";
import CourseCard from "@/app/lms-main/components/CourseCard";
import SearchBar from "@/app/lms-main/components/SearchBar";
import Pagination from "@/app/lms-main/components/Pagination";
import courseThumbnail from "/course-thumbnail.jpg";

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    {
      name: "Beginner",
      description: "Basic Investment Knowledge",
      level: "BEGINNER" as const,
      iconColor: "blue-500",
    },
    {
      name: "Intermediate",
      description: "Tips to Maintain Investment",
      level: "INTERMEDIATE" as const,
      iconColor: "teal-500",
    },
    {
      name: "Advanced",
      description: "Advance Invest Secrets for Stocks",
      level: "ADVANCED" as const,
      iconColor: "yellow-500",
    },
  ];

  const courses = [
    { level: "BEGINNER" as const, title: "Cara investasi saham dari 0" },
    { level: "BEGINNER" as const, title: "Cara investasi saham dari 0" },
    { level: "INTERMEDIATE" as const, title: "Strategi investasi menengah" },
    { level: "ADVANCED" as const, title: "Analisis teknikal lanjutan" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#030915" }}>
      <Header />

      <main className="container mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-bold mb-8">Category</h1>

        {/* Category Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              name={category.name}
              description={category.description}
              level={category.level}
              iconColor={category.iconColor}
              onClick={() => console.log(`Clicked ${category.name}`)}
            />
          ))}
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Courses Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              thumbnail={courseThumbnail}
              title={course.title}
              level={course.level.toLowerCase() as
                | "beginner"
                | "intermediate"
                | "advanced"}
              videoCount={10}
              duration="1 hr 20 min"
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={3}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
};

export default Index;
