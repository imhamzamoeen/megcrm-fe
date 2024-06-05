// async function uploadFiles(files: any) {
//     for (const file of files) {
//         if (!file) {
//             continue;
//         }

//         await new Promise((resolve, reject) => {
//             new Compressor(file, {
//                 quality: 0.4,
//                 async success(result) {
//                     try {
//                         await dbStore.store(dbStore.folder, "Survey", result);
//                         filesUploaded.value++;
//                         resolve();
//                     } catch (error) {
//                         reject(error);
//                     }
//                 },
//                 error(err) {
//                     console.log(err.message);
//                     reject(err);
//                 },
//             });
//         });
//     }
// }

// async function uploadFilesInChunks(files: any, chunkSize: number = 3) {
//     for (let i = 0; i < files.length; i += chunkSize) {
//         const chunk = files.slice(i, i + chunkSize);
//         await Promise.all(
//             chunk.map(async (file: any) => {
//                 if (!file) {
//                     return;
//                 }

//                 // Check if the file is an image
//                 if (file.type.startsWith("image/")) {
//                     // If it's an image, compress it
//                     await new Promise((resolve, reject) => {
//                         new Compressor(file, {
//                             quality: 0.4,
//                             async success(result) {
//                                 try {
//                                     await dbStore.store(dbStore.folder, "Survey", result);
//                                     filesUploaded.value++;

//                                     resolve();
//                                 } catch (error) {
//                                     reject(error);
//                                 }
//                             },
//                             error(err) {
//                                 console.log(err.message);
//                                 reject(err);
//                             },
//                         });
//                     });
//                 } else {
//                     // If it's not an image, upload it directly
//                     try {
//                         await dbStore.store(dbStore.folder, "Survey", file);
//                         filesUploaded.value++;
//                     } catch (error) {
//                         console.error("Error uploading file:", error);
//                     }
//                 }
//             })
//         );
//     }
// }
