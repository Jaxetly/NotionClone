<template>
	<div>
		<div class="flex justify-center my-5">
			<button @click="$emit('createDocument')" class="button-create">Создать документ</button>
		</div>
		<ul v-if="documents.length !== 0">
			<li 
				v-for="(documentTitle, index) in titles" 
				:key="index"  
				@click="$emit('switchDocument', index)"
				style="position: relative;"
				:class="['button-document',
					{ 'bg-blue-800': currentDocument === index }, {'bg-gray-800': currentDocument !== index}]"
			>
			<div v-html="documentTitle" class="title"></div>
			<button @click.stop="$emit('deleteDocument', index)" class="btn btn-transparent">
		      	<i class="bi bi-trash" style="font-size: 18.7px; color: red;"></i>
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
			const title = document.content.match(/<([^>]+)>(.*?)<\/\1>/);
			//const title = document.content.match(/<([^>]+)>([\s\S]*?)<\/\1>/);
			const maxLength = 32;
            if (title && !title[0].includes('></')) {
    			return title[0];

            }
            return 'Новый документ';
   			
		},
		getTitleDOMParser(document) {
			const parser = new DOMParser();
	        const doc = parser.parseFromString(document.content, 'text/html');
	        const firstElement = doc.body.firstChild;

	        if (firstElement && firstElement.textContent.trim()) {
		        return firstElement.textContent;
	        }
	        return 'Новый документ';
		}
	},
	computed: {
		titles() {
			return this.documents.map(content => this.getTitleDOMParser(content));
		}
	}
}
</script>

<style scoped>

.btn-transparent {
	position: absolute; 
	top: -1px; 
	right: -1px; 
	background: transparent;
	border: 1px solid rgb(75 85 99);
	border-radius: 6px;
}

.button-create {
	width: 90%;
	margin-top: 10px;
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
	color: white;
	cursor: pointer;
	padding: 0.5rem;
	margin: 0.5rem;
	border: 1px solid rgb(75 85 99);
	border-radius: 6px;
}

.title {
	max-width: 245px;
  	overflow: hidden;
  	text-overflow: ellipsis;
  	white-space: nowrap;
}
</style>