import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IPrincipal } from 'src/app/models/iprincipal';
import { BlogService } from 'src/app/services/paginas/blog.service';
import { PrincipalService } from 'src/app/services/paginas/principal.service';
import { SecurityService } from 'src/app/services/security.service';
import { faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { cpuUsage } from 'process';

@Component({
  selector: 'app-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css'],
})
export class PaginaPrincipalComponent implements OnInit, OnDestroy {
  @ViewChild('labelImport')
  labelImport: ElementRef;
  formEntrada: FormGroup;
  fileToUpload: File = null;
  secciones: IPrincipal[] = [];
  subscription$: Subscription;
  faTrash = faTrash;
  faArrowUp = faArrowUp;
  page: number;

  constructor(
    private formBuilder: FormBuilder,
    private toast: ToastrService,
    private route: Router,
    private principalService: PrincipalService,
    private blogService: BlogService,
    private securityService: SecurityService,
    private sanitizer: DomSanitizer
  ) {
    this.builderForm();
  }

  ngOnInit(): void {
    this.subscription$ = this.principalService
      .listarContenido()
      .subscribe((data) => {
        this.secciones = data.body;
        this.secciones.forEach((element) => {
          element.descripcion = this.sanitizer.bypassSecurityTrustHtml(
            data.body.find((f) => f.id == element.id).descripcion.toString()
          );
        });
      });
  }

  /*
   * Se construye el formulario
   */
  private builderForm(): void {
    this.formEntrada = this.formBuilder.group({
      texto: [null, [Validators.required]],
      ImagenPostFile: [null, [Validators.required]],
      descripcion: [null, [Validators.required]],
      id: [0, []],
    });
  }

  /**
   * Cambia el label del file input por el nombre del archivo
   * @param event
   * @param files
   */
  uploadFile(files: FileList): void {
    this.labelImport.nativeElement.innerText = Array.from(files)
      .map((f) => f.name)
      .join(', ');
    this.fileToUpload = files.item(0);
  }

  public guardarContenido(event: Event): void {
    try {
      var formData: FormData = new FormData();
      formData.append('image', event.target[0].files[0]);
      if (this.securityService.getDecodedAccessToken() == null) {
        this.securityService.logOff();
        this.route.navigate(['']);
      }
      if (this.secciones.length > 0) {
        this.formEntrada.get('texto').clearValidators();
        this.formEntrada.get('ImagenPostFile').clearValidators();
        this.formEntrada.get('descripcion').clearValidators();
        this.formEntrada.get('texto').updateValueAndValidity();
        this.formEntrada.get('ImagenPostFile').updateValueAndValidity();
        this.formEntrada.get('descripcion').updateValueAndValidity();
      }
      if (this.formEntrada.valid) {
        if (event.target[0].files[0] != undefined) {
          this.subscription$ = this.blogService
            .guardarImagePost(formData)
            .subscribe(
              (data) => {
                if (data.status == 201 || data.status == 200) {
                  if (this.secciones.length == 0) {
                    this.subscription$ = this.principalService
                      .guardarContenido(
                        this.formEntrada.value,
                        data.body.toString()
                      )
                      .subscribe(
                        (_data) => {
                          if (_data.status == 200 || _data.status == 201) {
                            this.toast.success(
                              'Seccion agregada correctamente'
                            );
                            const seccion: IPrincipal = {
                              descripcion: this.formEntrada.value.descripcion,
                              rutaImagen: data.body.toString(),
                              texto: this.formEntrada.value.texto,
                              estado: true,
                              id: parseInt(_data.body.mensaje),
                            };
                            this.secciones.unshift(seccion);
                            this.formEntrada.reset();
                          }
                        },
                        (err) => this.toast.error(err)
                      );
                  } else {
                    this.formEntrada.get('id').setValue(this.secciones[0].id);
                    this.subscription$ = this.principalService
                      .actualizarContenido(
                        this.formEntrada.value,
                        data.body.toString()
                      )
                      .subscribe((_data) => {
                        if (_data.status == 200 || _data.status == 201) {
                          this.toast.success('Seccion agregada correctamente');
                          const seccion: IPrincipal = {
                            descripcion: this.formEntrada.value.descripcion,
                            rutaImagen: data.body.toString(),
                            texto: this.formEntrada.value.texto,
                            estado: true,
                            id: parseInt(_data.body.mensaje),
                          };
                          this.formEntrada.reset();
                        }
                      });
                  }
                }
              },
              (err) => {
                if (err.status === 401) {
                  this.securityService.logOff();
                  this.route.navigate(['']);
                }
                this.toast.error(err);
              }
            );
        } else {
			this.formEntrada.get('id').setValue(this.secciones[0].id);
          this.subscription$ = this.principalService
            .actualizarContenido(this.formEntrada.value, null)
            .subscribe((_data) => {
              if (_data.status == 200 || _data.status == 201) {
                this.toast.success('Seccion agregada correctamente');
                const seccion: IPrincipal = {
                  descripcion: this.formEntrada.value.descripcion,
                  rutaImagen: null,
                  texto: this.formEntrada.value.texto,
                  estado: true,
                  id: parseInt(_data.body.mensaje),
                };
                this.formEntrada.reset();
              }
            });
        }
      } else {
        this.toast.warning('Campos por llenar');
      }
    } catch (error) {
      this.toast.error(error);
    }
  }

  /**
   * Crea una ruta para las imagenes
   * @param serverPath
   */
  public createImgPath = (serverPath: string) => {
    return `http://localhost:8090/${serverPath}`;
  };

  /**
   * Metodo quitar una subscripcion a un servicio
   */
  ngOnDestroy(): void {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }
}
