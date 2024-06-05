import { useToast } from '@/plugins/toastr'
import { useAuthStore } from '@/stores/auth/useAuthStore'
import { useLeadsStore } from '@/stores/leads/useLeadsStore'
import { sleep } from '@/utils/useHelper'
import axios from 'axios'
import { defineStore } from 'pinia'

export const useDropboxStore = defineStore('dropbox', () => {

  const loading = ref(false)

  const $toast = useToast()
  const auth: any = useAuthStore();
  const leadsStore: any = useLeadsStore();
  const folder = `${leadsStore.selectedLead.post_code
    .toUpperCase()
    .replace(/ /g, "")} - ${leadsStore.selectedLead.address.replace("/", "|")}`;

  const baseUrl = 'https://api.dropboxapi.com/2/files'
  const baseDirectory = ref('/CRM')
  const fileUploadEndpoint = "https://content.dropboxapi.com/2/files/upload";
  const newFolderEndpoint = `${baseUrl}/create_folder_v2`
  const folderFilesEndpoint = `${baseUrl}/list_folder`
  const renameEndpoint = `${baseUrl}/move_v2`
  const getTemporaryLinkEndpoint = `${baseUrl}/get_temporary_link`

  const intallationPicturesFolders: any = ref([])
  const folderImages: any = ref([])
  const surveyFileNames: any = ref([])
  const installationFileNames: any = ref([])
  const installationImages: any = ref([])
  const precheckingDocuments: any = ref([])

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.user.dropbox.data}`
  }

  const basicPostPayload = {
    "include_deleted": false,
    "include_has_explicit_shared_members": false,
    "include_media_info": true,
    "include_mounted_folders": true,
    "include_non_downloadable_files": true,
    "limit": 2000,
    "recursive": false
  }

  onMounted(async () => {
    try {
      await axios.post(folderFilesEndpoint, {
        ...basicPostPayload,
        path: `${baseDirectory.value}/${folder}`,
      }, { headers })
    } catch (e: any) {
      if (e.response && e.response.status === 409) {
        baseDirectory.value = '/ALL PRE SURVEYS'
      }
    }
  })

  const index = async (folderName: string, fetchLinks: boolean = true) => {
    try {
      loading.value = true

      const { data } = await axios.post(`${folderFilesEndpoint}`, {
        ...basicPostPayload,
        path: `${baseDirectory.value}/${folderName}/Survey`,
      }, {
        headers
      })

      data.entries = data.entries.filter((entry: any) => entry['.tag'] === 'file');

      const folderImageIds = new Set(folderImages.value.map((entry: any) => entry.id));

      // Filter data.entries to remove entries with IDs present in folderImageIds
      data.entries = data.entries.filter((entry: any) => !folderImageIds.has(entry.id));
      const combined = [
        ...folderImages.value,
        ...data.entries
      ]

      folderImages.value = combined.sort((a, b) => {
        const timestampA: any = new Date(a.client_modified);
        const timestampB: any = new Date(b.client_modified);

        // Compare timestamps
        return timestampB - timestampA;
      });

      if (fetchLinks) {
        getTemporaryLinks(folderImages)
      }
    } catch (e: any) {
      console.log("DROPBOX:index => ", e.message);
    } finally {
      loading.value = false
    }
  }

  const getInstallationPictures = async (folderName: string, fetchLinks: boolean = true) => {
    try {
      let images = []
      loading.value = true

      const { data } = await axios.post(`${folderFilesEndpoint}`, {
        ...basicPostPayload,
        path: `${baseDirectory.value}/${folderName}/Installation`,
      }, {
        headers
      })

      images.push(data.entries.filter((entry: any) => entry['.tag'] === 'file'))
      intallationPicturesFolders.value = data.entries.filter((entry: any) => entry['.tag'] === 'folder')

      for await (const folder of intallationPicturesFolders.value) {
        const { data } = await axios.post(`${folderFilesEndpoint}`, {
          ...basicPostPayload,
          path: `${baseDirectory.value}/${folderName}/Installation/${folder.name}`,
        }, {
          headers
        })

        images.push(data.entries.map((i: any) => ({
          ...i,
          folderName: folder.name
        })).filter((entry: any) => entry['.tag'] === 'file'))
      }

      let flattenedImages = [].concat(...images);

      const installationImageIds = new Set(installationImages.value.map((entry: any) => entry.id));

      // Filter data.entries to remove entries with IDs present in folderImageIds
      flattenedImages = flattenedImages.filter((entry: any) => !installationImageIds.has(entry.id));
      const combined = [
        ...installationImages.value,
        ...flattenedImages
      ]

      installationImages.value = combined.sort((a, b) => {
        const timestampA: any = new Date(a.client_modified);
        const timestampB: any = new Date(b.client_modified);

        // Compare timestamps
        return timestampB - timestampA;
      });

      if (fetchLinks) {
        getTemporaryLinks(installationImages)
      }
    } catch (e: any) {
      console.log("DROPBOX:index => ", e.message);
    } finally {
      loading.value = false
    }
  }

  const getPreCheckingFiles = async (folderName: string, fetchLinks: boolean = true) => {
    try {
      loading.value = true

      const { data } = await axios.post(`${folderFilesEndpoint}`, {
        ...basicPostPayload,
        path: `${baseDirectory.value}/${folderName}/Pre Checking`,
      }, {
        headers
      })

      precheckingDocuments.value = data.entries

      if (fetchLinks) {
        getTemporaryLinks(precheckingDocuments)
      }
    } catch (e: any) {
      console.log("DROPBOX:index => ", e.message);
    } finally {
      loading.value = false
    }
  }

  const create = async (newFolderName: string) => {
    try {
      loading.value = true;

      await axios.post(`${newFolderEndpoint}`, {
        autorename: false,
        path: `${baseDirectory.value}/${newFolderName}`
      }, {
        headers
      })

      $toast.success(`Folder with name ${newFolderName} was created.`)

    } catch (e: any) {
      console.log("DROPBOX:create => ", e.message);
    } finally {
      loading.value = false;
    }
  }

  const store = async (address: string, subFolder: string, file: any) => {
    try {
      loading.value = true;

      const headers = {
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          autorename: true,
          mode: "add",
          mute: false,
          path: `${baseDirectory.value}/${address}/${subFolder}/${file.name}`,
          strict_conflict: true,
        }),
        Authorization: `Bearer ${auth.user.dropbox.data}`,
      };

      await axios.post(fileUploadEndpoint, file, { headers });
    } catch (e: any) {
      console.log("DROPBOX:store => ", e.message);
      throw Error(e?.message)
    } finally {
      loading.value = false;
    }
  }

  const getTemporaryLink = (e: any) => {
    axios.post(`${getTemporaryLinkEndpoint}`, {
      path: `${e.path_display}`
    }, {
      headers
    }).then((r) => {
      e.link = r.data.link

    })
  }

  const getTemporaryLinks = async (ref: Ref) => {
    try {
      for (let i = 0; i < ref.value.length; i += 10) {
        const chunk = ref.value.slice(i, i + 10);

        for (const e of chunk) {
          if (!e.link) {
            getTemporaryLink(e);
          }
        }

        await sleep(1000);
      }

    } catch (e: any) {
      console.log("DROPBOX:create => ", e.message);
    }
  }

  const renameFile = async (oldPath: string, newPath: string) => {
    try {
      loading.value = true

      const { data } = await axios.post(`${renameEndpoint}`, {
        "allow_ownership_transfer": false,
        "allow_shared_folder": false,
        "autorename": true,
        "from_path": oldPath,
        "to_path": newPath
      }, {
        headers
      })

      $toast.success('File was renamed.')

      return data.metadata;
    }
    catch (e: any) {
      $toast.error(e?.message ?? 'Failed to rename, please try again.')
    } finally {
      loading.value = false
    }
  }

  watch(() => folderImages.value, (n, o) => {
    surveyFileNames.value = n.map((i: any) => i.name.split('.')[0])
  }, { deep: true })

  watch(() => installationImages.value, (n, o) => {
    installationFileNames.value = n.map((i: any) => i.name.split('.')[0])
  }, { deep: true })

  return {
    loading,
    folderImages,
    installationImages,
    folder,
    precheckingDocuments,
    surveyFileNames,
    installationFileNames,
    intallationPicturesFolders,

    renameFile,
    getInstallationPictures,
    getPreCheckingFiles,
    create,
    index,
    store,
  }
})
