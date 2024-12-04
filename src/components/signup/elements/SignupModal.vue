<script setup>
import { defineEmits } from "vue";
import Modal from "@/components/common/Modal.vue";
import VeeInput from "@/components/common/VeeInput.vue";
const props = defineProps({
  showModal: Boolean,
});
const emits = defineEmits();

const closeModal = () => {
  emits("hide-modal");
};
const callback = (response) => {
  emits("google", response.credential);
};
</script>
<template>
  <Modal
    :show-modal="props.showModal"
    @update:show-modal="props.showModal = $event"
    modal-id="exampleModal"
    :show-footer="false"
  >
    <template #header>
      <h4 class="modal-title text-center" id="exampleModalLabel">
        Start Your 7 Day Free Trial Today!
      </h4>
      <button
        type="button"
        class="close"
        @click="closeModal"
        data-dismiss="modal"
      >
        <span aria-hidden="true">×</span>
      </button>
    </template>
    <form @submit.prevent="submitForm" slot="body">
      <div class="form-group">
        <VeeInput
          name="company_name"
          placeholder="Company Name.."
          class="form-control input"
        />
        <VeeInput name="name" placeholder="Name.." class="form-control input" />
        <VeeInput
          name="email"
          type="email"
          placeholder="Email Address.."
          class="form-control input"
        />
        <VeeInput
          name="phone"
          placeholder="Phone Number..."
          class="form-control input"
        />
        <VeeInput
          name="password"
          type="password"
          placeholder="Password.."
          class="form-control input"
        />
        <button type="submit" class="btn btn-success">Submit</button>
        <GoogleLogin :callback="callback" prompt />
      </div>
    </form>
    <template #footer>
      <button
        type="button"
        class="btn btn-success text-center"
        @click="closeModal"
      >
        Custom Close
      </button>
    </template>
  </Modal>
</template>