<script setup>
import { ref, reactive, defineProps, watch, computed, defineEmits } from "vue";
import processImg from "@/assets/images/process.png";

const props = defineProps({
  modalTitle: String,
  modalText: String,
  confirmText: String,
});
const emits = defineEmits();

const confirmSubmit = () => {
  emits("confirm");
};
</script>
<template>
  <div
    class="modal model-regin fade"
    id="myform"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content px-md-4 p-sm-3 p-4">
        <button
          type="button"
          class="close"
          data-dismiss="modal"
          aria-hidden="true"
        >
          &times;
        </button>
        <h3 class="text-center">{{ props.modalTitle }}</h3>

        <img src="/images/question.png" />
        <p class="r3 px-md-5 px-sm-1">{{ props.modalText }}</p>

        <div class="text-center mb-3">
          <button
            class="btn btn-primary w-50 rounded-pill b1"
            data-toggle="modal"
            data-dismiss="modal"
            data-target="#Myform-overlay"
            @click="confirmSubmit"
          >
            {{ props.confirmText }}
          </button>
        </div>
        <!--                 
                <a href="#">Not now</a> -->
      </div>
    </div>
  </div>
</template>
