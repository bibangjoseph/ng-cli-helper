import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CoreService } from '../services/core.service';

// HttpRequestInterceptor to inject the token in the header of the request
export function HttpInterceptor(request: HttpRequest<any>, next: HttpHandlerFn) {
  const coreService = inject(CoreService);
  const token = coreService.getToken;
  const isAuth = coreService.isAuthenticated();
  const apiRegex = new RegExp(`^${environment.apiUrl}`);
  
  if (apiRegex.test(request.url)) {
    if (isAuth && token) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authReq);
    }
  }
  
  return next(request);
}
