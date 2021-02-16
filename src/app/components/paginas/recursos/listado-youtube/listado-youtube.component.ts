import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IYoutube } from 'src/app/models/iyoutube';
import { YoutubeService } from 'src/app/services/paginas/youtube.service';
import { faTrash, faEdit, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ToastrService } from 'ngx-toastr';
import { VideoYoutubeDetalleComponent } from '../video-youtube-detalle/video-youtube-detalle.component';

@Component({
	selector: 'listadoYoutube',
	templateUrl: './listado-youtube.component.html',
	styleUrls: ['./listado-youtube.component.css']
})
export class ListadoYoutubeComponent implements OnInit {

	entradas: IYoutube[] = [];
	entrada: IYoutube;
	public page: number;
	faTrash = faTrash;
	faEdit = faEdit;
	faArrowUp = faArrowUp;
	subscription$: Subscription;
	@ViewChild(VideoYoutubeDetalleComponent) videoYoutube: VideoYoutubeDetalleComponent;

	constructor(
		private youtubeService: YoutubeService,
		private toast: ToastrService,
	) { }

	ngOnInit(): void {
		this.youtubeService.obtenerEntradas().subscribe(data => {
			this.entradas = data.body;
		})
	}

	/**
	* Agrega a la lista de post un post que viene 
	* del componente crear-post
	*/
	agregarListaPost(entrada: IYoutube): void {
		this.entradas.unshift(entrada);
	}

	actualizarListaPost(entrada: IYoutube): void {
		const fila = this.entradas.find(f => f.slug == entrada.slug);
		fila.titulo = entrada.titulo;
		fila.rutaVideo = entrada.rutaVideo;
		fila.descripcion = entrada.descripcion;
	}

	/**
	 * Muestra el video de seleccionado para editarlo
	 * @param slug 
	 * @param $event 
	 */
	mostrarVideo(slug: string, $event: Event) {
		this.subscription$ = this.youtubeService.mostrarVideoYoutube(slug)
			.subscribe(data => {
				this.entrada = data.body;
				this.videoYoutube.mostrarContenido(this.entrada);
			});
	}

	/**
	 * Habilita un video de youtube
	 * @param slug 
	 * @param $event 
	 */
	habilitarVideo(slug: string, $event: Event): void {
		$event.preventDefault();
		this.subscription$ = this.youtubeService.cambiarEstadoEntradaVideo(slug)
			.subscribe(data => {
				if (data.status == 200 || data.status == 201) {
					const fila = this.entradas.find(f => f.slug == slug);
					fila.estado = true;
					Swal.fire(
						'Habilitado',
						'El video con slug ' + slug + ' ha sido habilitado nuevamente',
						'success'
					);
				}
			}, err => {
				this.toast.error(err);
			});
	}

	/**
	 * Elimina o inhabilita un video
	 * @param slug 
	 * @param $event 
	 */
	eliminarVideo(slug: string, $event: Event): void {
		const estadoBtn = this.entradas.find(f => f.slug == slug).estado;
		Swal.fire({
			title: '¿Deseas eliminar el video o inhabilitarlo?',
			icon: 'question',
			showCancelButton: true,
			cancelButtonText: 'Eliminar',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Inhabilitar',
			showConfirmButton: estadoBtn,
			showDenyButton: true,
			denyButtonText: 'Cancelar',
			showCloseButton: true,
		}).then(result => {
			if (result.dismiss == "cancel" && !result.isConfirmed) {
				this.subscription$ = this.youtubeService.eliminarEntradaVideo(slug)
					.subscribe(data => {
						if (data.status == 200 || data.status == 201) {
							Swal.fire(
								'Elimiado',
								'El video con slug ' + slug + ' esta eliminado',
								'success'
							);
							this.entradas = this.entradas.filter(f => f.slug != slug);
						}
					}, err => {
						this.toast.error(err);
					});
			} else if (result.isConfirmed && result.value) {
				this.subscription$ = this.youtubeService.cambiarEstadoEntradaVideo(slug)
					.subscribe(data => {
						if (data.status == 201 || data.status == 200) {
							const fila = this.entradas.find(f => f.slug == slug);
							fila.estado = false;
							Swal.fire(
								'Inhabilitado',
								'El video con slug ' + slug + ' esta inhabilitado',
								'success'
							);
						}
					}, err => {
						this.toast.error(err);
					});
			}
		})
	}

	/**
	* Metodo para desubscribir
	*/
	ngOnDestroy(): void {
		if (this.subscription$) {
			this.subscription$.unsubscribe();
		}
	}

	reproducir(){
		const audio = new Audio("assets/Go.mp3");
		audio.play();
	}

}
