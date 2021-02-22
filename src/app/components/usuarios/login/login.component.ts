import { ToastrService } from 'ngx-toastr';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ILogin } from 'src/app/models/ilogin';
import { SecurityService } from 'src/app/services/security.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  formLogin: FormGroup;
  subscription$: Subscription;
  IsAuthenticated: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: Router,
    private toast: ToastrService,
    private usuarioService: UsuarioService,
    private securityService: SecurityService
  ) {
    this.IsAuthenticated = this.securityService.IsAuthorized;
    if (this.IsAuthenticated === true) {
      this.route.navigate(['/home']);
    }
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required]],
      pass: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  public login() {
    const usuarioLogin: ILogin = {
      email: this.formLogin.value.email,
      pass: this.formLogin.value.pass,
    };
    if (this.formLogin.valid) {
      this.subscription$ = this.usuarioService.login(usuarioLogin).subscribe(
        (data) => {
          if (data.status == 200 || data.status == 201) {
            const token = data.body.response;
            this.securityService.setAuthData(token);
            this.route.navigate(['/home']);
          }
        },
        (err) => {
          this.toast.error(err);
          this.formLogin.reset();
        }
      );
    } else {
      this.formLogin.markAllAsTouched();
      this.toast.error('Hay campos obligatorios');
    }
  }

  /**
   * Metodo para desubscribir
   */
  ngOnDestroy() {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }
}
