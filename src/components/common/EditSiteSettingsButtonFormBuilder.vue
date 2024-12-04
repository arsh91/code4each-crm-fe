<template>
  <form @submit.prevent="submitForm">
    <div class="box-wrapper">
      <form class="button-from mt-2">
        <div v-for="(field, index) in siteSettingsFormFieldsCopy" :key="index">
          <div class="color2" v-if="field.field_type === 'button'">
            <button class="button btn-success">
              {{ capitalizeAndReplaceChar(field.field_name, "-") }}
            </button>
            <div class="row">
              <div class="col-sm-6 form-group">
                <label for="" class="form-label">Label</label>
                <input
                  type="text"
                  placeholder="Business Name"
                  class="form-control input"
                  :name="field.field_name"
                  v-model="formData[field.field_name]"
                />
                <div class="text-danger"></div>
              </div>
              <div class="col-sm-6 form-group">
                <label for="" class="form-label">Link</label>
                <input
                  type="url"
                  placeholder="https://www.google.com/"
                  aria-label="https://www.google.com/"
                  class="form-control input"
                  :name="field.field_name + '-meta1'"
                  v-model="formData[field.field_name + '-meta1']"
                />
                <div class="text-danger"></div>
              </div>
            </div>
            <div class="col-sm-12 form-group">
              <label for="" class="form-label">Action</label>
              <select
                class="form-select"
                aria-label="Select an option"
                :name="field.field_name + '-meta2'"
                v-model="formData[field.field_name + '-meta2']"
              >
                <option value="_self">Self</option>
                <option value="_blank">Blank</option>
              </select>
            </div>
          </div>
          <hr v-if="field.field_type === 'button'" />
        </div>
      </form>
      <!-- <div class="color2">
        <button class="button btn-primary">Button 2</button>
        <form class="button-from mt-2">
          <div class="row">
            <div class="col-sm-6 form-group">
              <label for="" class="form-label">Label</label>
              <input
                type="text"
                placeholder="Business Name"
                class="form-control input"
              />
              <div class="text-danger"></div>
            </div>
            <div class="col-sm-6 form-group">
              <label for="" class="form-label">links</label>
              <input
                type="url"
                placeholder="https://www.google.com/"
                aria-label="https://www.google.com/"
                class="form-control input"
              />
              <div class="text-danger"></div>
            </div>
          </div>
          <div class="col-sm-12 form-group">
            <label for="" class="form-label">blink</label>
            <select class="form-select" aria-label="Select an option">
              <option value="">Open this select menu</option>
              <option value="1">Education</option>
              <option value="2">Health</option>
              <option value="3">Digital Marketing</option>
              <option value="4">Information</option>
            </select>
          </div>
        </form>
      </div> -->
    </div>
    <!-- <div v-for="(field, index) in siteSettingsFormFieldsCopy" :key="index">
      <div class="img-wrapper">
        <label
          for="form-control"
          class="form-field"
          v-if="field.field_type === 'textarea' || field.field_type === 'text'"
          >{{ capitalizeAndReplaceChar(field.field_name, "-") }}</label
        >
        <textarea
          class="form-control input"
          v-if="field.field_type === 'textarea'"
          placeholder=""
          rows="2"
          :name="field.field_name"
          v-model="formData[field.field_name]"
        ></textarea>
        <input
          type="text"
          v-else-if="field.field_type === 'text'"
          class="form-control"
          :name="field.field_name"
          v-model="formData[field.field_name]"
        />
      </div>
    </div> -->
  </form>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed, onMounted } from "vue";
import VeeInput from "@/components/common/VeeInput.vue";
import * as yup from "yup";
import { useForm } from "vee-validate";
import { capitalizeAndReplaceChar } from "@/util/helper";
import SelectBox from "@/components/common/SelectBox.vue";
import { EventBus } from "@/EventBus";

const isButtonDisabled = ref(false);
const resetToggle = ref(true);
const formData = ref({});

const emits = defineEmits();
const props = defineProps({
  siteSettingsFormFields: Object,
});

const { handleSubmit } = useForm({
  validationSchema: yup.object({}),
});

const buttonClickOptions = computed(() => [
  {
    label: "Self",
    value: "_self",
  },
  {
    label: "Blank",
    value: "_blank",
  },
]);

const submitForm = () => {
  try {
    emits("submit-custom-fields", formData.value);
  } catch (error) {}
};

const siteSettingsFormFieldsCopy = ref(props.siteSettingsFormFields);

const changeHiddenValuesForAllFields = () => {
  siteSettingsFormFieldsCopy.value = JSON.parse(
    JSON.stringify(props.siteSettingsFormFields)
  );

  siteSettingsFormFieldsCopy.value.forEach((field) => {
    let value = field.default_value;
    let meta1 = field.default_meta1;
    let meta2 = field.default_meta2;

    if (resetToggle.value === false) {
      value = field.value != null ? field.value : field.default_value;
      meta1 = field.meta1 != null ? field.meta1 : field.default_meta1;
      meta2 = field.meta2 != null ? field.meta2 : field.default_meta2;
    }
    field.value = value;
    field.meta2 = meta2;
    field.meta1 = meta1;
  });
  resetToggle.value = !resetToggle.value;
};

watch(
  () => props.siteSettingsFormFields,
  (newProp, oldProp) => {
    siteSettingsFormFieldsCopy.value = props.siteSettingsFormFields;
    siteSettingsFormFieldsCopy.value.forEach((field) => {
      if (field.field_type === "button") {
        formData.value[field.field_name] =
          field.value != null ? field.value : field.default_value;
        formData.value[field.field_name + "-meta1"] =
          field.meta1 != null ? field.meta1 : field.default_meta1;
        formData.value[field.field_name + "-meta2"] =
          field.meta2 != null ? field.meta2 : field.default_meta2;
      }
    });
  }
);

onMounted(() => {
  EventBus.on("submitButtonFormChildMethod", submitForm);
});
</script>
<style scoped>
.inline-buttons button {
  display: inline;
}

.inline-buttons {
  text-align: center;
}
</style>
