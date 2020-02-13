<template>
    <div style="height: 100vh;" class="q-pa-md flex flex-center">
        <div style="width: 500px;">
            <div class="q-mb-lg text-h5">Test 2</div>
            <div>
                <div
                    v-for="(option, index) in store.select.options"
                    :key="index"
                    class="q-mb-md"
                >
                    <strong>Option {{index + 1}}</strong>
                    <q-input v-model="option.label" placeholder="Label" />
                    <q-input v-model="option.value" placeholder="Value" />
                </div>
            </div>
            <q-btn @click="store.helpers.push(store.select, 'options', { value: '', label: '' })" label="Ajouter une option" />
            <q-select :options="store.select.options" v-model="store.select.select" label="Choisi une option" />
        </div>
    </div>
</template>