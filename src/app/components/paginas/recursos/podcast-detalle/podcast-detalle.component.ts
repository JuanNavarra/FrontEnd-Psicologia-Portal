import { HttpResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { distinct } from 'rxjs/operators';
import { Categorias } from 'src/app/models/categorias';
import { IPodcast } from 'src/app/models/ipodcast';
import { IResponse } from 'src/app/models/iresponse';
import { KeyWords } from 'src/app/models/key-words';
import { BlogService } from 'src/app/services/paginas/blog.service';
import { PodcastService } from 'src/app/services/paginas/podcast.service';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-podcast-detalle',
  templateUrl: './podcast-detalle.component.html',
  styleUrls: ['./podcast-detalle.component.css'],
})
export class PodcastDetalleComponent implements OnInit {
  @ViewChild('labelImport')
  labelImport: ElementRef;
  fileToUpload: File = null;
  entradaPodcast: IPodcast;
  habilitar: boolean = true;
  keys: KeyWords[] = [];
  dropdownSettings: any = {};
  subscription$: Subscription;
  categorias: Categorias[] = [];
  formEntrada: FormGroup;
  @Output() podcastEntradaEmiter = new EventEmitter<IPodcast>();

  constructor(
    private blogService: BlogService,
    private securityService: SecurityService,
    private route: Router,
    private toast: ToastrService,
    private formBuilder: FormBuilder,
    private podcastService: PodcastService
  ) {
    this.entradaPodcast = {
      creador: null,
      descripcion: null,
      estado: false,
      keyWords: null,
      rutaaudio: null,
      slug: null,
      subtitulo: null,
      imagenCreador: null,
      fechacreacion: null,
      idBlog: null,
      categoria: null,
      categoriaId: null,
      titulo: null,
    };
  }

  ngOnInit(): void {
    this.subscription$ = this.blogService
      .obtenerKeyWords()
      .subscribe((data) => {
        this.keys = data.body;
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

    this.builderForm();
    this.castToNumber(this.formEntrada.get('categoriaId'));
  }

  /**
   * Castea un objeto del formgroup
   * @param data
   */
  private castToNumber(data: AbstractControl) {
    data.valueChanges
      .pipe(distinct())
      .subscribe((value) => data.setValue(+value || 0));
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
      AudioPodcastFile: [null, []],
      categoriaId: [null, []],
      descripcion: [null, []],
      creador: [null, []],
    });
  }

  /**
   * Crea una ruta para las audios
   * @param serverPath
   */
  public createAudioPath = (serverPath: string) => {
    return `https://localhost:44329/${serverPath}`;
  };

  mostrarContenido(entrada: IPodcast): void {
    this.entradaPodcast = entrada;
  }

  habilitarDatos($event: Event): void {
    this.habilitar = !this.habilitar;
    this.subscription$ = this.blogService
      .listarCategorias()
      .subscribe((data) => {
        this.categorias = data.body.filter(
          (f) => f.nombre != this.entradaPodcast.categoria
        );
      });
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
      this.formEntrada.get('slug').setValue(this.entradaPodcast.slug);
      var formData: FormData = new FormData();
      formData.append('audio', $event.target[1].files[0]);
      if ($event.target[1].files[0] != undefined) {
        this.actualizarAudio(formData);
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
  private actualizarAudio(formData: FormData): void {
    this.subscription$ = this.podcastService
      .guardarAudioPodcast(formData)
      .subscribe(
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
   * Actualiza un post
   * @param formulario
   * @param data
   */
  private actualizarPost(
    formulario: any,
    _data?: HttpResponse<IResponse>
  ): void {
    const ruta = _data == undefined ? null : _data.body.toString();
    this.subscription$ = this.podcastService
      .actualizarEntradaPodcast(formulario, ruta)
      .subscribe(
        (data) => {
          if (data.status === 201 || data.status === 200) {
            this.toast.success(data.body.mensaje);
            const podcast: IPodcast = {
              categoria: null,
              creador: null,
              descripcion:
                this.formEntrada.value.descripcion ??
                this.entradaPodcast.descripcion,
              estado: true,
              keyWords: null,
              subtitulo: null,
              fechacreacion: null,
              categoriaId: null,
              idBlog: null,
              imagenCreador: null,
              rutaaudio: ruta ?? this.entradaPodcast.rutaaudio,
              slug: this.entradaPodcast.slug,
              titulo:
                this.formEntrada.value.titulo ?? this.entradaPodcast.titulo,
            };
            this.podcastEntradaEmiter.emit(podcast);
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
   * Metodo para desubscribir
   */
  ngOnDestroy() {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }
}
