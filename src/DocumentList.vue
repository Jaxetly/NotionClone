<template>
	<div>
		<div class="button-create__container">
			<button @click="$emit('createDocument')" class="button-create">Создать документ</button>
		</div>
		<ul v-if="documents.length !== 0">
			<li 
				v-for="(document, index) in documents"
				@click="$emit('switchDocument', index)"
				:class="['button-document', { 'active': currentDocument === index }]"
			>
			<div class="title">{{ getTitle(document) }}</div>
			<button v-if="documents.length > 1" @click.stop="$emit('deleteDocument', index)" class="btn btn-transparent">
		      	<i class="bi bi-trash" style="font-size: 18px; color: red;"></i>
		    </button>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'DocumentList',
	props: {
		documents: {
			type: Array,
			required: true
		},
		currentDocument: Number
	},
	methods: {
		getTitle(document) {
			const parser = new DOMParser();
	        const doc = parser.parseFromString(document.content, 'text/html');
	        const firstElement = doc.body.firstChild;

	        if (firstElement && firstElement.textContent.trim()) {
		        return firstElement.textContent;
	        }
	        return 'Новый документ';
		}
	}
}
</script>

<style scoped>

.btn-transparent {
	position: absolute; 
	padding: 0.3rem 0.675rem;
	top: 50%;
	transform: translate(0, -50%);
	right: 0px; 
	background: transparent;
	border-left: 1px solid rgb(75 85 99);
}

.button-create__container {
	margin: 1rem;
	display: flex;
	justify-content: center;
}

.button-create {
	width: 100%;
	margin: 5px;
	padding: 4px;
	font-weight: 600;
	font-size: 1.2rem;
	background: rgb(59 130 246);
	border-radius: 4px;
	cursor: pointer;
}

.button-create:hover {
	background: rgb(49 120 236);
}

.button-document {
	position: relative;
	color: white;
	cursor: pointer;
	padding: 0.4rem;
	margin: 0.5rem;
	border: 1px solid rgb(75 85 99);
	border-radius: 6px;
	background: rgb(31 41 55);
}

.button-document.active {
	background: rgb(55 65 81);
}

.title {
	max-width: calc(100% - 40px);
  	overflow: hidden;
  	text-overflow: ellipsis;
  	white-space: nowrap;
}
</style>