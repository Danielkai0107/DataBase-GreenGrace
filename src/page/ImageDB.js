import React, { useEffect, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, list, deleteObject } from "firebase/storage";
import { storage } from '../lib/firebase';
import { Button } from 'react-bootstrap';


function ImageDB() {
  const [divName, setDivName] = useState("PlantIMG");
  const [images, setImages] = useState([]);
  const [searchedImages, setSearchedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageUrls, setImageUrls] = useState({}); 
  const [showNoResultsMessage, setShowNoResultsMessage] = useState(false);


  useEffect(() => {
    fetchImages();
  }, [divName]);

  const fetchImages = async () => {
    if (divName !== "") {
      const imagesRef = ref(storage, divName);
      const res = await list(imagesRef);
      const urls = {};
      for (let imageRef of res.items) {
        urls[imageRef.name] = await getDownloadURL(imageRef);
      }
      setImageUrls(urls);
      setImages(res.items);
      // 檢查 selectedImage 是否仍在新的 images 列表中
      if (selectedImage && !res.items.some(item => item.fullPath === selectedImage.fullPath)) {
        setSelectedImage(null);
      }
    }
  };
  const handleSearch = () => {
    const results = images.filter(imageRef => imageRef.name.includes(searchTerm));
    setSearchedImages(results);
    setSelectedImage(null);

    if (results.length === 0) {
      setShowNoResultsMessage(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowNoResultsMessage(false);
      }, 3000);
    }
};

  const handleUpload = async (event, replace = false) => {
    const file = event.target.files[0];
    if (file && divName !== "") {
      const storageRef = replace && selectedImage ? selectedImage : ref(storage, `${divName}/` + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on('state_changed', 
        () => {}, 
        (error) => {
          console.error(error);
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            fetchImages();  // Refresh the list after upload
            if(replace) {
              setSelectedImage(null); // Clear selection after replacing
            }
          });
        }
      );
    }
  };
  
  const handleImageSelect = (imageRef) => {
    setSelectedImage(imageRef);
  };
  const handleDelete = async (imageRefToDelete) => {
    if (imageRefToDelete) {
      await deleteObject(imageRefToDelete);
      setSelectedImage(null);
      fetchImages();
    }
  };
  const handleCancelSelect = () => {
    setSelectedImage(null)
  };
  const handleAll = () => {
    setSearchedImages([])
    setSelectedImage(null)
    setSearchTerm('')
  };

  return (
    <main className='ImageDB'>
      <aside className='aside-menu'>
        <p className='aside-menu-title'>圖庫</p>
        <ul>
          <li className={divName === 'PlantIMG' ? 'active' : ''} onClick={()=>{setDivName('PlantIMG')}}><p>植物圖庫 Plants</p></li>
          <li className={divName === 'WeddingIMG' ? 'active' : ''} onClick={()=>{setDivName('WeddingIMG')}}><p>婚禮圖庫 Wedding</p></li>
        </ul>
      </aside>
      <article className='data-area'>
      <p className='data-area-title'>商 品 圖 庫</p>
        {/* Upload image */}
        <section className='btnGroup'>
          <label htmlFor="upload_img" className='file-btn'>
            <input id="upload_img" type="file" onChange={(e) => handleUpload(e, false)} />
            <span>Upload</span>
          </label>
        </section>
        {/* Display Search Results */}
        <section className='search-area'>
          <span>Search</span>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="" />
          <Button variant="outline-secondary" onClick={handleSearch}>Search</Button>
          <Button variant="outline-secondary" onClick={handleAll}>全部</Button>
          {showNoResultsMessage && <p className='no-result'>( No results )</p>}
        </section>
        {/* Display image */}
        <article className='display-area'>
          <section className='list-container'>
            <h3 className='title'>Images List</h3>
            {searchedImages.length === 0 ? 
            <>
            {images.map((imageRef, index) => (
              <ul 
                key={index} 
                onClick={() => handleImageSelect(imageRef)}
                className={selectedImage === imageRef ? 'selected' : ''}
              >
                <li>
                  {imageUrls[imageRef.name] && 
                    <figure>
                      <img src={imageUrls[imageRef.name]} alt={imageRef.name}/>
                    </figure>
                  }
                  <span>
                    {imageRef.name}
                  </span>
                </li>
                <li>
                  { imageRef === selectedImage &&
                    <label htmlFor="edit_img" className='file-btn'>
                      <input id="edit_img" type="file" onChange={(e) => handleUpload(e, true)}/>
                      <span>Update</span>
                    </label>}
                  <Button variant="outline-danger" onClick={() => handleDelete(imageRef)} >刪除</Button>
                </li>
              </ul>
            ))}
            </> : 
            <>
            {searchedImages.map((imageRef, index) => (
              <ul 
                key={index} style={{cursor: 'pointer'}} 
                onClick={() => handleImageSelect(imageRef)}
                className={selectedImage === imageRef ? 'selected' : ''}
              >
                <li>
                  {imageUrls[imageRef.name] && 
                    <figure>
                      <img src={imageUrls[imageRef.name]} alt={imageRef.name}/>
                    </figure>
                  }
                  <span>
                    {imageRef.name}
                  </span>
                </li>
                <li>
                  { imageRef === selectedImage &&
                    <label htmlFor="edit_img" className='file-btn'>
                      <input id="edit_img" type="file" onChange={(e) => handleUpload(e, true)}/>
                      <span>更新</span>
                    </label>}
                  <Button variant="outline-danger" onClick={() => handleDelete(imageRef)} >刪除</Button>
                </li>
              </ul>
            ))}
            </>}
            
          </section>
          <section className='view-container'>
            <h3 className='title'>Preview</h3>
            {selectedImage && <Button className='cancel-btn' variant="outline-secondary" onClick={handleCancelSelect} >清除</Button>}
            <figure>
              {selectedImage && (
                <img src={imageUrls[selectedImage.name]} alt="Selected from Firebase" />
              )}
            </figure>
          </section>
        </article>
      </article>
    </main>
  );
}

export default ImageDB;
