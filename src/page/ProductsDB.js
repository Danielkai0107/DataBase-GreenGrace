import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { plantsCategory ,weddingCategory} from '../lib/category';
import { Button, Form, InputGroup } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';



function ProductsDB() {
  const [nameDB, setNameDB] = useState("plants");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
    price: "",
    sizeInfo: "",
    categoryName: "",
    categoryNameEn: "",
    LayerSize: "",
    variants: [{
      color: "",
      info: "",
      productImage: "",
      displayImage: ""
    }]
  });

  useEffect(() => {
    if (nameDB !== "") {
      const unsubscribe = onSnapshot(collection(db, nameDB), (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setProducts(data);
      });
      return () => unsubscribe();
    }
  }, [nameDB]);
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        color: "",
        info: "",
        productImage: "",
        displayImage: ""
      }]
    }));
  };
  const getCurrentTime = () => {
    return new Date().toISOString();
  };
  const handleVariantChange = (index, key, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][key] = value;
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };
  const handleSubmit = async () => {
    if (formData.name === "" ||
      formData.price === "" ||
      formData.categoryName === "" ||
      formData.categoryNameEn === "" ||
      formData.variants.some(variant => 
        variant.color === "" ||
        variant.info === "" ||
        variant.productImage === "" ||
        variant.displayImage === ""
      )
    ) {
      setError("請輸入完整資料");
      setTimeout(() => {
        setError(null);
      }, 3000);
      return;
    }

    // 確保price和LayerSize都是數字
    const numericPrice = parseFloat(formData.price);
    const numericLayerSize = parseFloat(formData.LayerSize);
    const currentTime = getCurrentTime(); // 獲取當前時間

    if (selectedProducts) {
      // update
      await updateDoc(doc(db, nameDB, selectedProducts.id), {
        ...formData,
        price: numericPrice,
        LayerSize: numericLayerSize,
        lastUpdated: currentTime
      });
      setSelectedProducts(null);
    } else {
      // add
      await addDoc(collection(db, nameDB), {
        ...formData,
        price: numericPrice,
        LayerSize: numericLayerSize,
        selectedVariantIndex: 0,
        lastUpdated: currentTime
      });
    }
    resetFormData();
};
  const resetFormData = () => {
    setFormData({
      name: "",
      price: 0,
      sizeInfo: "",
      categoryName: "",
      categoryNameEn: "",
      LayerSize: 0,
      variants: [{
        color: "",
        info: "",
        productImage: "",
        displayImage: ""
      }]
    });
  };
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, nameDB, id));
    if (selectedProducts && selectedProducts.id === id) {
      resetFormData();
      setSelectedProducts(null);
    }
  };
  const deleteVariant = (index) => {
    const updatedVariants = [...formData.variants];
    updatedVariants.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };
  const handleSelectPlant = (plant) => {
    setSelectedProducts(plant);
    setFormData(plant);
  };
  const handleCopySubmit = async () => {
    if (formData.name === "" ||
      formData.price === "" ||
      formData.categoryName === "" ||
      formData.categoryNameEn === "" ||
      formData.variants.some(variant => 
        variant.color === "" ||
        variant.info === "" ||
        variant.productImage === "" ||
        variant.displayImage === ""
      )
    ) {
      setError("Fields cannot contain spaces");
      setTimeout(() => {
        setError(null);
      }, 3000);
      return;
    }
    // 複製當前 formData 並儲存到資料庫
    const numericPrice = parseFloat(formData.price);
    const numericLayerSize = parseFloat(formData.LayerSize);
    const currentTime = getCurrentTime();
    await addDoc(collection(db, nameDB), {
        ...formData,
        price: numericPrice,
        LayerSize: numericLayerSize,
        selectedVariantIndex: 0,
        id: null, // 確保新的物品具有一個新的ID
        lastUpdated: currentTime
    });
    resetFormData();
  };
  const handleClear = async () => {
    setSelectedProducts(null)
    setFormData({
      name: "",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
      price: "",
      sizeInfo: "",
      categoryName: "",
      categoryNameEn: "",
      LayerSize: "",
      variants: [{
        color: "",
        info: "",
        productImage: "",
        displayImage: ""
      }]
    })
  };

  return (
    <main className='ProductsDB'>
      <aside className='aside-menu'>
        <p className='aside-menu-title'>資料庫</p>
        <ul>
          <li className={nameDB === 'plants' ? 'active' : ''} onClick={()=>{setNameDB('plants')}}><p>植物商品 Plants</p></li>
          <li className={nameDB === 'wedding' ? 'active' : ''} onClick={()=>{setNameDB('wedding')}}><p>婚禮道具 Wedding</p></li>
        </ul>
      </aside>
      <article className='data-area'>
        <section className='data-area-title'>商 品 資 料 庫 
        {error ? <p style={{color: "#dc3545",letterSpacing: "2px",fontSize: ".8rem"}}>{error}</p>:<p>( {nameDB} DataBase )</p>}
        </section>
        <section className='edit'>
          <div className='input-form'>
            <Form className='mt-1'>
              <Row className="mb-3">
                <Col>
                  <InputGroup >
                    <InputGroup.Text id="basic-addon1">Name</InputGroup.Text>
                    <Form.Control
                      placeholder="Name"
                      aria-label="Name"
                      aria-describedby="basic-addon1"
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup >
                    <InputGroup.Text id="basic-addon2">Price</InputGroup.Text>
                    <Form.Control
                      placeholder="Price"
                      aria-label="Price"
                      aria-describedby="basic-addon2"
                      value={formData.price} 
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || "" })}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup >
                    <InputGroup.Text id="basic-addon3">Size</InputGroup.Text>
                    <Form.Control
                      placeholder="Size"
                      aria-label="Size"
                      aria-describedby="basic-addon3"
                      value={formData.sizeInfo} 
                      onChange={e => setFormData({ ...formData, sizeInfo: e.target.value })}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <Form.Select 
                  aria-label="Default"
                  value={`${formData.categoryName},${formData.categoryNameEn}`} 
                  onChange={(e) => {
                      const [name, nameEn] = e.target.value.split(',');
                      setFormData(prev => ({
                          ...prev,
                          categoryName: name,
                          categoryNameEn: nameEn
                      }));
                    }}
                  >
                    <option>category</option>

                    {nameDB ==='plants' ? 
                      <>
                        {plantsCategory.map(cat => (
                          <option key={cat.categoryName} value={`${cat.categoryName},${cat.categoryNameEn}`}>
                              {cat.categoryName} ({cat.categoryNameEn})
                          </option>
                        ))}
                      </>:
                      <>
                        {weddingCategory.map(cat => (
                          <option key={cat.categoryName} value={`${cat.categoryName},${cat.categoryNameEn}`}>
                              {cat.categoryName} ({cat.categoryNameEn})
                          </option>
                        ))}
                      </>
                    }
                  </Form.Select>
                </Col>
              </Row>
              <Row>
                <Col sm={3}>
                  <InputGroup >
                    <InputGroup.Text id="basic-addon4">Layer</InputGroup.Text>
                    <Form.Control
                      placeholder="Layer"
                      aria-label="Layer"
                      aria-describedby="basic-addon4"
                      value={formData.LayerSize} 
                      onChange={e => setFormData({ ...formData, LayerSize: parseFloat(e.target.value) || "" })}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Form>
            
            {formData.variants.map((variant, index) => (
              <article key={index} className='style-input'>
                <section className='input-style-title'>
                </section>
                  <Row key={index}>
                    <Col>
                      <InputGroup >
                        <InputGroup.Text id="basic-addon5">Color</InputGroup.Text>
                        <Form.Control
                          placeholder="Color"
                          aria-label="Color"
                          aria-describedby="basic-addon5"
                          value={variant.color} 
                          onChange={e => handleVariantChange(index, 'color', e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <InputGroup >
                        <InputGroup.Text id="basic-addon6">Info</InputGroup.Text>
                        <Form.Control
                          placeholder="Info"
                          aria-label="Info"
                          aria-describedby="basic-addon6"
                          value={variant.info} 
                          onChange={e => handleVariantChange(index, 'info', e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <InputGroup >
                        <InputGroup.Text id="basic-addon7">P-IMG</InputGroup.Text>
                        <Form.Control
                          placeholder="Product Image"
                          aria-label="Product Image"
                          aria-describedby="basic-addon7"
                          value={variant.productImage} 
                          onChange={e => handleVariantChange(index, 'productImage', e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <InputGroup >
                        <InputGroup.Text id="basic-addon8">D-IMG</InputGroup.Text>
                        <Form.Control
                          placeholder="Display Image"
                          aria-label="Display Image"
                          aria-describedby="basic-addon8"
                          value={variant.displayImage} 
                          onChange={e => handleVariantChange(index, 'displayImage', e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      {index !== 0 && <Button variant="outline-danger" onClick={() => deleteVariant(index)}>Delete</Button>}
                    </Col>
                </Row>
              </article>
            ))}
            <section className='input-form-btnGroup'>
              <Button variant="outline-secondary" size='sm' onClick={addVariant}>新增樣式</Button>
              <div className='submit-btn'>
                <Button variant="outline-danger" onClick={handleClear}>清空</Button>
                <Button variant="outline-secondary" onClick={handleCopySubmit}>複製</Button>
                <Button variant="secondary" onClick={handleSubmit}>{selectedProducts ? "更新" : "送出"}</Button> 
              </div>
            </section>
          </div>
        </section>
        <ul className='list'>
          <h4 className='title'>Products List <span>( 共計{products.length}項 )</span></h4>
          {products.map(product => (
            <li key={product.id} 
              className={selectedProducts === product ? 'selected' : ''}
              onClick={() => handleSelectPlant(product)}
            >
              <div >
                <span>
                  {product.id}
                </span>
                <span>
                  {product.name}
                </span>
                <span>
                  {product.categoryName}
                </span>
                <span>
                  {product.price} 元
                </span>
                <span>
                  {product.lastUpdated}
                </span>
              </div>
              <Button variant="outline-danger" onClick={() => handleDelete(product.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}

export default ProductsDB;
