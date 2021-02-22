import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faTrash, faEdit, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { IPodcast } from 'src/app/models/ipodcast';
import { PodcastService } from 'src/app/services/paginas/podcast.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ToastrService } from 'ngx-toastr';
import { PodcastDetalleComponent } from '../podcast-detalle/podcast-detalle.component';

@Component({
  selector: 'listadoPodcast',
  templateUrl: './listado-podcast.component.html',
  styleUrls: ['./listado-podcast.component.css'],
})
export class ListadoPodcastComponent implements OnInit, OnDestroy {
  entradas: IPodcast[] = [];
  entrada: IPodcast;
  public page: number;
  faTrash = faTrash;
  faEdit = faEdit;
  faArrowUp = faArrowUp;
  subscription$: Subscription;
  @ViewChild(PodcastDetalleComponent) podcast: PodcastDetalleComponent;

  constructor(
    private podcastService: PodcastService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.subscription$ = this.podcastService
      .obtenerEntradas()
      .subscribe((data) => {
        this.entradas = data.body;
      });
  }

  /**
   * Agrega a la lista de post un post que viene
   * del componente crear-post
   */
  agregarListaPost(entrada: IPodcast): void {
    this.entradas.unshift(entrada);
  }

  /**
   * Habilita un podcast
   * @param slug
   * @param $event
   */
  habilitarPodcast(slug: string, $event: Event): void {
    $event.preventDefault();
    this.subscription$ = this.podcastService
      .cambiarEstadoEntradaPodcast(slug)
      .subscribe(
        (data) => {
          if (data.status == 200 || data.status == 201) {
            const fila = this.entradas.find((f) => f.slug == slug);
            fila.estado = true;
            Swal.fire(
              'Habilitado',
              'El Podcast con slug ' + slug + ' ha sido habilitado nuevamente',
              'success'
            );
          }
        },
        (err) => {
          this.toast.error(err);
        }
      );
  }

  /**
   * Elimina o inhabilita un podcast
   * @param slug
   * @param $event
   */
  eliminarPodcast(slug: string, $event: Event): void {
    const estadoBtn = this.entradas.find((f) => f.slug == slug).estado;
    Swal.fire({
      title: '¿Deseas eliminar el Podcast o inhabilitarlo?',
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Eliminar',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Inhabilitar',
      showConfirmButton: estadoBtn,
      showDenyButton: true,
      denyButtonText: 'Cancelar',
      showCloseButton: true,
    }).then((result) => {
      if (result.dismiss == 'cancel' && !result.isConfirmed) {
        this.subscription$ = this.podcastService
          .eliminarEntradaPodcast(slug)
          .subscribe(
            (data) => {
              if (data.status == 200 || data.status == 201) {
                Swal.fire(
                  'Elimiado',
                  'El Podcast con slug ' + slug + ' esta eliminado',
                  'success'
                );
                this.entradas = this.entradas.filter((f) => f.slug != slug);
              }
            },
            (err) => {
              this.toast.error(err);
            }
          );
      } else if (result.isConfirmed && result.value) {
        this.subscription$ = this.podcastService
          .cambiarEstadoEntradaPodcast(slug)
          .subscribe(
            (data) => {
              if (data.status == 201 || data.status == 200) {
                const fila = this.entradas.find((f) => f.slug == slug);
                fila.estado = false;
                Swal.fire(
                  'Inhabilitado',
                  'El Podcast con slug ' + slug + ' esta inhabilitado',
                  'success'
                );
              }
            },
            (err) => {
              this.toast.error(err);
            }
          );
      }
    });
  }

  /**
   * Muestra el podcast de seleccionado para editarlo
   * @param slug
   * @param $event
   */
  mostrarPodcast(slug: string, $event: Event) {
    this.subscription$ = this.podcastService
      .mostrarPodcast(slug)
      .subscribe((data) => {
        this.entrada = data.body;
        this.podcast.mostrarContenido(this.entrada);
      });
  }

  /**
   * Crea una ruta para las audios
   * @param serverPath
   */
  public createAudioPath = (serverPath: string) => {
    return `https://localhost:44329/${serverPath}`;
  };

  /**
   * Metodo para quitar una subscripcion
   */
  ngOnDestroy() {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }

  /**
   * Actualiza la fila de un video de youtube
   * @param entrada
   */
  actualizarListaPost(entrada: IPodcast): void {
    const fila = this.entradas.find((f) => f.slug == entrada.slug);
    fila.titulo = entrada.titulo;
    fila.rutaaudio = entrada.rutaaudio;

    console.log(fila);
    console.log(this.entradas);
  }
}
