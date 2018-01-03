export class Student {
  constructor(public name: string, public id: string) {
  }

  public toString(): string {
    return JSON.stringify({ name: this.name, id: this.id });
  }
}
export class Submission {
  title: string;
  department: string;
  className: string;
  major: string;
  students: Array<Student>;
  file: File;
  constructor(title?: string,
    department?: string,
    className?: string,
    major?: string) {
    this.title = title || '';
    this.department = department || '';
    this.className = className || '';
    this.major = major || '';
    this.students = new Array<Student>();
  }
}
