<script setup lang="ts">
import { signOut } from "firebase/auth";
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

const auth = useFirebaseAuth()!; // only exists on client side

signOut(auth).then(() => window.location.href = '/')

</script>

<template>
</template>