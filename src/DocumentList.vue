<template>
	<div>
		<div class="flex justify-center my-5">
			<button @click="$emit('createDocument')" class="button">Создать документ</button>
		</div>
		<ul v-if="documents.length !== 0">
			<li 
				v-for="(documentTitle, index) in titles" 
				:key="index" 
				v-html="documentTitle" 
				@click="$emit('switchDocument', index)"
				:class="['cursor-pointer', 'border', 'rounded-lg', 'p-2', 'm-2', 'border-gray-600', 'text-white', 
					{ 'bg-blue-800': currentDocument === index }, {'bg-gray-800': currentDocument !== index}]"
			>
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
	            const textContent = firstElement.textContent;

	            if (textContent.length > 30) {
		           return textContent.slice(0, 30) + '...';
		        }
		        return textContent;
	        }
	        return 'Новый документ';
		}
	},
	computed: {
		titles() {
			return this.documents.map(content => this.getTitleDOMParser(content));
		}
	},
	mounted() {
    	console.log(this.documents);
	}

}
</script>

<style >
.button {
	width: 90%;
	margin-top: 10px;
	padding: 4px;
	font-weight: 600;
	font-size: 1.2rem;
	background: rgb(59 130 246);
	border-radius: 4px;
	cursor: pointer;
}

.button:hover {
	background: rgb(49 120 236);
}
</style>