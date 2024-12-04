<template>
  <form @submit.prevent="submitForm">
    <div v-for="(field, index) in siteSettingsFormFieldsCopy" :key="index">
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
    </div>
    <!-- </div> -->
    <!-- <div class="form-group">
      <div v-for="(field, index) in siteSettingsFormFieldsCopy" :key="index">
        <div v-if="field.field_type != 'image'">
          <div v-if="field.field_type === 'button'">
            <label class="form-label" style="display: flex">{{
              capitalizeAndReplaceChar(field.field_name, "-")
            }}</label>
            <VeeInput
              :name="field.field_name"
              placeholder="Label"
              class="form-control input mb-3"
              label="Label"
              type="text"
              :textarea="field.field_type === 'textarea'"
              :hiddenValue="
                field.value != null ? field.value : field.default_value
              "
            />
            <VeeInput
              :name="field.field_name + '-meta1'"
              placeholder="Link"
              class="form-control input mb-3"
              label="Link"
              type="text"
              :textarea="field.field_type === 'textarea'"
              :hiddenValue="
                field.meta1 != null ? field.meta1 : field.default_meta1
              "
            />
            <SelectBox
              :name="field.field_name + '-meta2'"
              inputClass="form-select"
              ariaLabel="Select an option"
              :options="buttonClickOptions"
              defaultText="Open this select menu"
              :defaultValue="
                field.meta2 != null ? field.meta2 : field.default_meta2
              "
              label="Action"
            >
            </SelectBox>
          </div>
          <VeeInput
            v-else
            :name="field.field_name"
            :placeholder="field.field_name"
            class="form-control input mb-3"
            :label="capitalizeAndReplaceChar(field.field_name, '-')"
            :type="field.field_type === 'image' ? 'file' : 'text'"
            :textarea="field.field_type === 'textarea'"
            :hiddenValue="
              field.value != null ? field.value : field.default_value
            "
          />
        </div>
      </div>

      <div class="inline-buttons">
        <button
          type="submit"
          :disabled="isButtonDisabled"
          class="btn btn-success mt-4 me-2"
        >
          Submit
        </button>
        <button
          type="button"
          @click="changeHiddenValuesForAllFields"
          class="btn btn-success mt-4"
        >
          {{ resetToggle ? "Set Default Values" : "Undo Values" }}
        </button>
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

// const submitForm = handleSubmit(async (values) => {
//   isButtonDisabled.value = true;
//   try {
//     // emits("submit-custom-fields", values);
//     isButtonDisabled.value = false;
//   } catch (error) {}
// });

const submitForm = () => {
  try {
    emits("submit-custom-fields", formData.value);
    isButtonDisabled.value = false;
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
      if (field.field_type === "textarea" || field.field_type === "text") {
        formData.value[field.field_name] =
          field.value != null ? field.value : field.default_value;
      }
    });
  }
);

onMounted(() => {
  EventBus.on("submitFormChildMethod", submitForm);
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
