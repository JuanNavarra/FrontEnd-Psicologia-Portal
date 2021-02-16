import { Component, OnDestroy, OnInit } from '@angular/core';
import { faArrowUp, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { IListEntrada } from 'src/app/models/ilist-entrada';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ToastrService } from 'ngx-toastr';
import { BlogService } from 'src/app/services/paginas/blog.service';

@Component({
	selector: 'listadoPost',
	templateUrl: './listado-post.component.html',
	styleUrls: ['./listado-post.component.css']
})
export class ListadoPostComponent implements OnInit, OnDestroy {

	entradas: IListEntrada[] = [];
	public page: number;
	subscription$: Subscription;
	faTrash = faTrash;
	faEdit = faEdit;
	faArrowUp = faArrowUp;

	constructor(
		private blogService: BlogService,
		private toast: ToastrService,
	) { }

	ngOnInit(): void {
		this.blogService.obtenerEntradas().subscribe(data => {
			this.entradas = data.body;
		})
	}

	public createImgPath = (serverPath: string) => {
		return `https://localhost:44329/${serverPath}`;
	}

	/**
	 * Agrega a la lista de post un post que viene 
	 * del componente crear-post
	 */
	agregarListaPost(entrada: IListEntrada): void {
		this.entradas.unshift(entrada);
	}

	eliminarPost(slug: string, $event: Event): void {
		const estadoBtn = this.entradas.find(f => f.slug == slug).estado;
		Swal.fire({
			title: '¿Deseas eliminar el post o inhabilitarlo?',
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
				this.subscription$ = this.blogService.eliminarEntradaPost(slug)
					.subscribe(data => {
						if (data.status == 200 || data.status == 201) {
							Swal.fire(
								'Elimiado',
								'El post con slug ' + slug + ' esta eliminado',
								'success'
							);
							this.entradas = this.entradas.filter(f => f.slug != slug);
						}
					}, err => {
						this.toast.error(err);
					});
			} else if (result.isConfirmed && result.value) {
				this.subscription$ = this.blogService.cambiarEstadoEntradaPost(slug)
					.subscribe(data => {
						if (data.status == 201 || data.status == 200) {
							const fila = this.entradas.find(f => f.slug == slug);
							fila.estado = false;
							Swal.fire(
								'Inhabilitado',
								'El post con slug ' + slug + ' esta inhabilitado',
								'success'
							);
						}
					}, err => {
						this.toast.error(err);
					});
			}
		})
	}

	mostrarPost(slug: string, $event: Event): void {

	}

	/**
	 * Habilita un Post de youtube
	 * @param slug 
	 * @param $event 
	 */
	habilitarPost(slug: string, $event: Event): void {
		$event.preventDefault();
		this.subscription$ = this.blogService.cambiarEstadoEntradaPost(slug)
			.subscribe(data => {
				if (data.status == 200 || data.status == 201) {
					const fila = this.entradas.find(f => f.slug == slug);
					fila.estado = true;
					Swal.fire(
						'Habilitado',
						'El post con slug ' + slug + ' ha sido habilitado nuevamente',
						'success'
					);
				}
			}, err => {
				this.toast.error(err);
			});
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
