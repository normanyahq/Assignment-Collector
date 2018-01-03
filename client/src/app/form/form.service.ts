import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FormService {
  constructor(private http: HttpClient) {
  }

  public postData(url: string, payload: FormData): Observable<Object> {
    return this.http.post(url, payload);
  }

  public getDeadline(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.http.get('/deadline').subscribe(data => {
        const date = new Date(data['body']);
        resolve(date.toLocaleString());
      });
    });
  }

}
