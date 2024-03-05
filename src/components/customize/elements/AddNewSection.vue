<template>
    <div class="tabs">
        <div
         v-for="(
                allComponentValue, index
            ) in allComponents"
            :key="index"
            >
            <div
            :class="!newComponent ? 'new-layout' : 'Current-layout'"
            @click="newComponent = allComponentValue.component_unique_id"
            >
                <i
                class="fa fa-check"
                aria-hidden="true"
                v-if="newComponent == allComponentValue.component_unique_id "
                ></i>
                <img
                :src="
                    config.CRM_API_URL +
                    '/' +
                allComponentValue.preview
                "
                />
            </div>
        </div>
        <div class="button-wrapper">
            <button
            type="submit"
            class="preview-btn"
            @click="addNewComponent"
            :disabled="btnDisable"
            >
            <i class="fa fa-upload" aria-hidden="true"></i>
            Publish
            </button>
            <div class="three-bodyc" v-if="btnDisable">
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
            </div>
        </div>
    </div>
</template>
<script setup>
import WordpressService from "@/service/WordpressService";
import { onMounted, ref, defineProps , defineEmits} from "vue";
import { number } from "yup";
import config from "/config";
import { useStore } from "@/stores/store";

const newComponent = ref();
const props = defineProps({
    categoryId: String,
    domain: String,
    position: String
});

const emits = defineEmits();
const allComponents = ref({});
const btnDisable =ref(false)
const store = useStore();

const getComponents = async () => {
  try {
    const response =
      await WordpressService.Components.getComponentsToAdd({
        category_id: props.categoryId
      });
    if (response.status === 200 && response.data.success) {
        console.log(response.data.components_detail)
        allComponents.value = response.data.components_detail
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const addNewComponent = async () => {
  try {
    emits('loading', true)
    btnDisable.value = true
    if(newComponent.value){
        const response =
        await WordpressService.Components.addComponent({
            component_unique_id: newComponent.value,
            website_url: props.domain,
            position: props.position
        });
        if (response.status === 200) {
            emits("refreshData");
            store.updateFlashMeassge(true, "Changes Saved Sucessfully");
        }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  btnDisable.value = false
  emits('loading', false)
};

onMounted(async () => {
  await getComponents();
});

</script>
