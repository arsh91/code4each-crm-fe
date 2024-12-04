<script setup>
import { ref, inject, onMounted, provide, watch } from "vue";
import { copyTextToClipboard } from "@/util/helper";
import { EventBus } from "@/EventBus.js";
import WordpressService from "@/service/WordpressService";

const dashBoardMethods = inject("dashBoardMethods");
const props = defineProps({
  websiteData: Object,
});
const submittedColors = ref([]);
const tooltipText = ref("copy");
const colorItems = ref();

const submitColors = async () => {
  EventBus.emit("loadingOnOff", true);
  try {
    const transformedObject = colorItems.value.reduce((result, item) => {
      result[item.name] = item.color;
      return result;
    }, {});
    const response = await WordpressService.updateGlobalColors({
      website_url: props.websiteData[0].website_domain,
      colors: transformedObject,
    });
    if (response.status === 200 && response.data.success) {
      getGlobalColors();
      reloadIframe();
    }
  } catch (error) {
    console.log(error);
    console.error("Error Occur while getting global colors", error);
  }
  EventBus.emit("loadingOnOff", false);
};

const openLinkInNewTab = () => {
  const url = props.websiteData[0].website_domain;
  if (url) {
    window.open(url, "_blank");
  }
};

const handleCopyClick = (text) => {
  copyTextToClipboard(text);
  tooltipText.value = "Copied";
  setTimeout(() => {
    tooltipText.value = "Copy";
  }, 1000);
};
const websiteIframe = ref();
const reloadIframe = () => {
  websiteIframe.value.src = websiteIframe.value.src;
};

const getGlobalColors = async () => {
  try {
    const response = await WordpressService.getGlobalColors({
      website_url: props.websiteData[0].website_domain,
    });

    if (response.status === 200 && response.data.success) {
      let allColors = response.data.colors;
      colorItems.value = Object.keys(allColors).map((key) => ({
        name: key,
        color: allColors[key],
      }));
    }
  } catch (error) {
    console.log(error);
    console.error("Error Occur while getting global colors", error);
  }
};
onMounted(() => {
  getGlobalColors();
  reloadIframe();
  EventBus.on("reloadIframe", reloadIframe);
});

provide("reloadIframe", "reloadIframe");
</script>
<template>
  <div
    class="col-lg-12 col-xl-12 d-flex justify-content-center"
    id="wordPressPage"
    style="margin: 0px auto"
  >
    <div class="card mb-4">
      <div class="card-body">
        <div class="col-12 col-lg-6 mb-6 mb-lg-0">
          <div class="box-1 bg-light user">
            <div class="box-inner-1 pb-3 mb-3">
              <div class="img-wrapper">
                <iframe
                  ref="websiteIframe"
                  v-if="websiteData.length >= 1"
                  class="websiteLinkFrame"
                  height="450"
                  frameborder="0"
                  :src="websiteData[0].website_domain"
                ></iframe>
                <img v-else src="/images/wordpres.png" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6 col-xl-5">
          <div class="box-2">
            <div class="box-inner-2">
              <div>
                <p class="fw-bold">Instance Access</p>
                <p class="text-wrapper">
                  Complete your purchase by providing your payment details
                </p>
              </div>
              <form class="text-start mb-2 mt-3">
                <div class="form-field mb-4">
                  <label for="basic-url" class="form-label">Website URL</label>
                  <div class="input-group mb-3">
                    <input
                      type="url"
                      class="form-control"
                      placeholder="https://www.google.com/"
                      :value="websiteData['0'].website_domain"
                      aria-label="https://www.google.com/"
                      aria-describedby="button-addon2"
                    />
                  </div>
                  <button
                    class="btn btn-outline-success btn-success linkBtn"
                    type="button"
                    id="button-addon2"
                    @click="openLinkInNewTab"
                  >
                    <i class="fa fa-share-square"></i>
                  </button>

                  <button
                    class="btn btn-outline-success btn-success text-light linkBtn"
                    type="button"
                    id="button-addon3"
                  >
                    <i
                      class="fa fa-copy"
                      data-toggle="tooltip"
                      data-placement="top"
                      :title="tooltipText"
                      @click="handleCopyClick(websiteData[0].website_domain)"
                    ></i>
                  </button>
                  <button
                    class="btn btn-outline-danger btn-danger text-light"
                    type="button"
                    id="button-addon3"
                    @click="dashBoardMethods.regenerateWebsite"
                  >
                    Regenerate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="row mb-4">
        <p class="fw-bold text-center mb-3">Customize Your Site</p>
        <div class="mt-3">
          <div class="d-flex">
            <div
              v-for="colorItem in colorItems"
              :key="colorItem.name"
              class="colorPickerInputs"
            >
              <input
                :type="'color'"
                v-model="colorItem.color"
                class="me-2 ms-4"
                style="height: 20px; width: 20px"
              />
              <label :for="colorItem.name">{{ colorItem.name }}</label>
            </div>

            <!-- <div v-for="colorItem in colorItems" :key="colorItem.name">
              <label :for="colorItem.name">{{ colorItem.name }}</label>
              <input
                :id="colorItem.name"
                v-model="colorItem.color"
                type="color"
              />
            </div> -->
            <button
              @click="submitColors"
              class="btn btn-success me-4 mt-1 mb-1"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
@import "@/assets/wordpress.css";
.colorPickerInputs {
  display: flex;
  align-items: center;
}
</style>
