import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // El formulario con sus campos
  loginForm: FormGroup;

  // Para mostrar errores del servidor
  errorMessage: string = '';

  // Para mostrar el spinner mientras carga
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Definimos los campos y sus validaciones
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Se ejecuta al hacer click en "Iniciar sesión"
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        // Guardamos el token y redirigimos al dashboard
        this.authService.saveSession(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        // Mostramos el error al usuario
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.isLoading = false;
      }
    });
  }
}
