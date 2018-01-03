import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

export interface Student {
  id: string;
  name: string;
}

export interface Submission {
  title: string;
  className: string;
  department: string;
  major: string;
  students: Student[];
}

@Injectable()
export class AdminService {

  constructor(private http: HttpClient) { }

  public getSubmissions(): Promise<Array<Submission>> {
    return new Promise<Array<Submission>>((resolve, reject) => {
      this.http.get('/submissions').subscribe(data => {
        resolve(<Array<Submission>>data);
      });
    });
  }

  public getDeadline(): Promise<Date> {
    return new Promise<Date>((resolve, reject) => {
      this.http.get('/deadline').subscribe(data => {
        const deadline = new Date(data['body']);
        resolve(deadline);
      });
    });
  }

  public postDeadline(time: Date): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const payload = { deadline: time.getTime() };
      this.http.post('/deadline', payload).subscribe(data => {
        resolve();
      });
    });
  }

  public archieveAndReset(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.post('/archieve', {}).subscribe(data => {
        if (data && !data['error']) {
          resolve(data['message']);
        } else {
          reject(data['message']);
        }
      });
    });
  }

}
