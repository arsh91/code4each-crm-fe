<template>
  <div class="front-layout-cont">
    <router-view />
    <FrontFooter/>
  </div>
</template>
<script>
import FrontFooter from '../../components/home/elements/Footer.vue'
export default {
  components: {FrontFooter}
}

</script>