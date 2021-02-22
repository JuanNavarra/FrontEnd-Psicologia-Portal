import { HttpResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { distinct } from 'rxjs/operators';
import { Categorias } from 'src/app/models/categorias';
import { IEntrada } from 'src/app/models/ientrada';
import { IResponse } from 'src/app/models/iresponse';
import { KeyWords } from 'src/app/models/key-words';
import { BlogService } from 'src/app/services/paginas/blog.service';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-entrada-post-detalle',
  templateUrl: './entrada-post-detalle.component.html',
  styleUrls: ['./entrada-post-detalle.component.css'],
})
export class EntradaPostDetalleComponent implements OnInit {
  @ViewChild('labelImport')
  labelImport: ElementRef;
  entrada: IEntrada;
  keys: KeyWords[] = [];
  categorias: Categorias[] = [];
  habilitar: boolean = true;
  dropdownSettings: any = {};
  read: boolean = true;
  fileToUpload: File = null;
  subscription$: Subscription;
  formEntrada: FormGroup;
  @Output() postEntradaEmiter = new EventEmitter<IEntrada>();

  constructor(
    private blogService: BlogService,
    private formBuilder: FormBuilder,
    private securityService: SecurityService,
    private route: Router,
    private toast: ToastrService
  ) {
    this.builderForm();
    this.castToNumber(this.formEntrada.get('idcategoria'));
    this.entrada = {
      slug: null,
      titulo: null,
      subTitulo: null,
      descripcion: null,
      cita: null,
      autorCita: null,
      fechaCreacion: null,
      creador: null,
      idcategoria: null,
      imagenCreador: null,
      imagenPost: null,
      keyWords: null,
      idBlog: null,
      estado: true,
      ImagenPostFile: null,
      categoria: null,
    };
  }

  ngOnInit(): void {
    this.subscription$ = this.blogService
      .obtenerKeyWords()
      .subscribe((data) => {
        this.keys = data.body;
      });

    this.subscription$ = this.blogService
      .listarCategorias()
      .subscribe((data) => {
        this.categorias = data.body;
      });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'nombre',
      selectAllText: 'Seleccionar todo',
      unSelectAllText: 'Quitar todos',
      itemsShowLimit: 8,
      allowSearchFilter: true,
    };
  }

  /**
   * Se construye el formulario
   */
  private builderForm(): void {
    this.formEntrada = this.formBuilder.group({
      keyWords: [null, []],
      titulo: [null, []],
      slug: [null, []],
      subTitulo: [null],
      citaCheck: [false],
      autorCita: [null],
      cita: [null],
      ImagenPostFile: [null, []],
      idcategoria: [null, []],
      descripcion: [null, []],
      creador: [null, []],
    });
  }

  /**
   * Crea una ruta para las imagenes
   * @param serverPath
   */
  public createImgPath = (serverPath: string) => {
    return `https://localhost:44329/${serverPath}`;
  };

  /**
   * Muestra el contenido en el formulario
   * @param entrada
   */

  public mostrarContenido(entrada: IEntrada): void {
    this.entrada = entrada;
  }

  /**
   * Habilita el formulario
   * @param $event
   */
  public habilitarDatos($event: Event): void {
    this.habilitar = !this.habilitar;
  }

  /**
   * Cambia el label del file input por el nombre del archivo
   * @param event
   * @param files
   */
  public uploadFile(files: FileList) {
    this.labelImport.nativeElement.innerText = Array.from(files)
      .map((f) => f.name)
      .join(', ');
    this.fileToUpload = files.item(0);
  }

  /**
   * Habilita la creacion de las citas en el formulario
   */
  public onCheckCita() {
    let check: boolean = this.formEntrada.value.citaCheck;
    this.read = !check;
    if (check) {
      this.formEntrada.get('autorCita').setValidators([Validators.required]);
      this.formEntrada.get('cita').setValidators([Validators.required]);
    } else {
      this.formEntrada.get('autorCita').clearValidators();
      this.formEntrada.get('cita').clearValidators();
      this.formEntrada.get('autorCita').reset();
      this.formEntrada.get('cita').reset();
    }
    this.formEntrada.get('autorCita').updateValueAndValidity();
    this.formEntrada.get('cita').updateValueAndValidity();
  }

  /**
   * Castea un objeto del formgroup a un entero
   * @param data
   */
  private castToNumber(data: AbstractControl): void {
    data.valueChanges
      .pipe(distinct())
      .subscribe((value) => data.setValue(+value || 0));
  }

  /**
   * Metodo usado para actualizar un post de una entrada
   * y a su vez emite un mensaje para que se puedea listar en otro componente
   * @param $event
   */
  public actualizarEntrada($event: Event): void {
    $event.preventDefault();
    if (this.securityService.getDecodedAccessToken() == null) {
      this.securityService.logOff();
      this.route.navigate(['']);
    }
    if (this.formEntrada.valid) {
      this.formEntrada
        .get('creador')
        .setValue(this.securityService.getDecodedAccessToken().User);
      this.formEntrada.get('slug').setValue(this.entrada.slug);
      var formData: FormData = new FormData();
      formData.append('image', $event.target[1].files[0]);
      if ($event.target[1].files[0] != undefined) {
        this.actualizarImagen(formData);
      } else {
        this.actualizarPost(this.formEntrada.value);
      }
    } else {
      this.toast.error('Error al enviar el formulario');
    }
  }

  /**
   * Actualiza una imagen y un post
   * @param formData
   */
  private actualizarImagen(formData: FormData): void {
    this.subscription$ = this.blogService.guardarImagePost(formData).subscribe(
      (data) => {
        if (data.status == 200 || data.status == 201)
          this.actualizarPost(this.formEntrada.value, data);
      },
      (err) => {
        this.toast.error('error ' + err);
      }
    );
  }

  /**
   * Actualiza un post
   * @param formulario
   * @param data
   */
  private actualizarPost(
    formulario: any,
    _data?: HttpResponse<IResponse>
  ): void {
    const ruta = _data == undefined ? null : _data.body.toString();
    this.subscription$ = this.blogService
      .actualizarEntradaPost(formulario, ruta)
      .subscribe(
        (data) => {
          if (data.status === 201 || data.status === 200) {
            this.toast.success(data.body.mensaje);
            const youtube: IEntrada = {
              slug: this.entrada.slug,
              titulo: this.formEntrada.value.titulo ?? this.entrada.titulo,
              subTitulo: null,
              descripcion: null,
              cita: null,
              autorCita: null,
              fechaCreacion: null,
              creador: null,
              idcategoria: null,
              imagenCreador: null,
              imagenPost:
                this.formEntrada.value.imagenPost ?? this.entrada.imagenPost,
              keyWords: null,
              idBlog: null,
              ImagenPostFile: null,
              categoria: null,
              estado: true,
            };
            this.postEntradaEmiter.emit(youtube);
          }
        },
        (err) => {
          if (err === null) {
            this.securityService.logOff();
            this.route.navigate(['']);
          }
          this.toast.error(err);
        }
      );
  }

  /**
   * Metodo que quita una subscripcion a un servicio
   */
  ngOnDestroy(): void {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }
}
