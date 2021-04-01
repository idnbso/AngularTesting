import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { CoursesService } from "./courses.service";
import {
  COURSES,
  findLessonsForCourse,
  LESSONS,
} from "../../../../server/db-data";
import { Course } from "../model/course";
import { HttpErrorResponse } from "@angular/common/http";

describe("CoursesService", () => {
  let coursesService: CoursesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoursesService],
    });

    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should retrieve all courses", () => {
    coursesService.findAllCourses().subscribe((courses) => {
      expect(courses).toBeTruthy("No courses returned");

      expect(courses.length).toBe(
        Object.values(COURSES).length,
        "incorrect number of courses"
      );

      const angularCourse = courses.find((course) => course.id === 12);
      expect(angularCourse.titles.description).toBe("Angular Testing Course");
    });

    const req = httpTestingController.expectOne("/api/courses");
    req.flush({ payload: Object.values(COURSES) });

    expect(req.request.method).toEqual("GET");
  });

  it("should find a course by id", () => {
    const courseId = 12;
    coursesService.findCourseById(courseId).subscribe((course) => {
      expect(course).toBeTruthy("No course returned");
      expect(course.id).toBe(courseId);
    });

    const req = httpTestingController.expectOne(`/api/courses/${courseId}`);
    req.flush(COURSES[courseId]);

    expect(req.request.method).toEqual("GET");
  });

  it("should save the course data", () => {
    const courseId = 12;
    const changes: Partial<Course> = {
      titles: { description: "Testing Course" },
    };

    coursesService.saveCourse(courseId, changes).subscribe((course) => {
      expect(course).toBeTruthy("No course returned");
      expect(course.titles.description).toBe(changes.titles.description);
    });

    const req = httpTestingController.expectOne(`/api/courses/${courseId}`);
    const changedCourse = { ...COURSES[courseId], ...changes };
    req.flush(changedCourse);

    expect(req.request.method).toEqual("PUT");
    expect(req.request.body.titles.description).toEqual(
      changes.titles.description
    );
  });

  it("should give an error if save course fails", () => {
    const courseId = 12;
    const changes: Partial<Course> = {
      titles: { description: "Testing Course" },
    };
    const internalServerErrorStatusCode = 500;

    coursesService.saveCourse(courseId, changes).subscribe(
      () => fail("The save course should have failed."),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(internalServerErrorStatusCode);
      }
    );

    const req = httpTestingController.expectOne(`/api/courses/${courseId}`);

    expect(req.request.method).toEqual("PUT");
    req.flush("Save course failed", {
      status: internalServerErrorStatusCode,
      statusText: "Internal Server Error",
    });
  });

  it("should find a list of lessons", () => {
    const courseId = 12;
    const defaultPageSize = 3;
    const courseLessonsMockValues = Object.values(
      findLessonsForCourse(courseId).slice(0, defaultPageSize)
    );

    coursesService.findLessons(courseId).subscribe((lessons) => {
      expect(lessons).toBeTruthy();
      expect(courseLessonsMockValues.length).toBe(defaultPageSize);
    });

    const req = httpTestingController.expectOne(
      (lessonsRequest) => lessonsRequest.url === "/api/lessons"
    );

    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get("courseId")).toEqual(courseId.toString());
    expect(req.request.params.get("filter")).toEqual("");
    expect(req.request.params.get("sortOrder")).toEqual("asc");
    expect(req.request.params.get("pageNumber")).toEqual("0");
    expect(req.request.params.get("pageSize")).toEqual(
      courseLessonsMockValues.length.toString()
    );

    req.flush({
      payload: courseLessonsMockValues,
    });
  });
});
