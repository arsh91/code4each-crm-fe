<template>
  <div
    :id="modalId"
    class="modal fade"
    tabindex="-1"
    :class="{ show: showModal, 'd-block': showModal }"
    aria-hidden="true"
    aria-labelledby="exampleModalLabel"
  >
    <div class="modal-dialog custom-modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <slot name="header">
            <h5 class="modal-title">Modal Header</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </slot>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer" v-if="showFooter">
          <slot name="footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Close
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
const props = defineProps({
  showModal: Boolean,
  showFooter: Boolean,
  modalId: String,
});

const emits = defineEmits();

const closeModal = () => {
  emits("update:showModal", false);
};
</script>