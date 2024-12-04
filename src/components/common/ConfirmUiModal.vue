<script setup>
import {
  ref,
  reactive,
  defineProps,
  watch,
  computed,
  defineEmits,
  onMounted,
} from "vue";
import processImg from "@/assets/images/process.png";

const props = defineProps({
  modalTitle: String,
  modalText: String,
  confirmText: String,
  showModal: Boolean,
});
const emits = defineEmits();
const confirmSubmit = () => {
  emits("confirm");
};

const hodeModal = () => {
  emits("hide");
};
</script>
<template>
  <div
    class="modal model-regin fade"
    id="modalContactForm"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
    :class="{ show: props.showModal, 'd-block': props.showModal }"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content px-md-4 p-sm-3 p-4">
        <button type="button" class="close" @click="hodeModal">&times;</button>
        <h3 class="text-center">{{ props.modalTitle }}</h3>

        <img src="/images/question.png" />
        <p class="r3 px-md-5 px-sm-1">{{ props.modalText }}</p>

        <div class="text-center mb-3">
          <button
            class="btn btn-primary w-50 rounded-pill b1"
            @click="confirmSubmit"
          >
            {{ props.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>
