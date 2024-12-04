<template>
  <div class="form-group">
    <label :for="name" class="form-label" :class="labelClass">{{
      label
    }}</label>
    <div>
      <input
        v-if="inputType === 'text'"
        :type="inputType"
        :name="name"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="form-control"
        :class="inputClass"
        v-validate="'required'"
      />

      <textarea
        v-else-if="inputType === 'textarea'"
        :name="name"
        :value="modelValue"
        @input="modelValue = $emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="form-control"
        :class="inputClass"
        :rows="rows"
      ></textarea>
      <select
        v-else-if="inputType === 'select'"
        :name="name"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="form-control"
        :class="inputClass"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :class="inputClass"
        >
          {{ option.label }}
        </option>
      </select>
      <input
        v-else-if="inputType === 'file'"
        :type="inputType"
        :name="name"
        @change="handleFileChange"
        class="form-control-file"
        :class="inputClass"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from "vue";
import { useField } from "vee-validate";
const {
  name,
  label,
  inputType,
  value,
  placeholder,
  options,
  inputClass,
  labelClass,
  rows,
} = defineProps([
  "name",
  "label",
  "inputType",
  "value",
  "placeholder",
  "options",
  "inputClass",
  "labelClass",
  "rows",
]);
// const modelValue = ref(value);
const { value: modelValue, errorMessage: fieldErrors } = useField(name);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  modelValue.value = file;
};
</script>
