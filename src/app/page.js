"use client";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tech0-gen8-step4-pos-app-10.azurewebsites.net/";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [product, setProduct] = useState({ NAME: "", PRICE: "", CODE: "" });
  const [purchaseList, setPurchaseList] = useState([]);

  // 数値のみ＆13桁制限
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // 数値以外を削除
    if (value.length <= 13) {
      setInputValue(value);
    }
  };

  // 商品マスタ問い合わせ処理
  const handleSearch = async () => {
    if (!inputValue) {
      alert("商品コードを入力してください。");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/product?code=${inputValue}`);
      if (!response.ok) throw new Error("データ取得失敗");
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("APIエラー:", error);
      setProduct({ CODE: inputValue, NAME: "商品が見つかりません", PRICE: "-" });
    }
  };

  // 購入リストへ追加
  const handleAddToList = () => {
    if (!product.NAME || product.NAME === "商品がマスタ未登録です") {
      alert("有効な商品を検索してから追加してください。");
      return;
    }

    // 数量は常に1
    const quantity = 1;
    const price = product.PRICE !== "-" ? parseInt(product.PRICE, 10) : 0;
    const total = quantity * price;

    // 新しいリストデータを作成
    const newItem = {
      NAME: product.NAME,
      QUANTITY: quantity,
      PRICE: price,
      TOTAL: total
    };

    // 購入リストを更新（過去のデータを保持しつつ、新しいデータを末尾に追加）
    setPurchaseList((prevList) => [...prevList, newItem]);

    // 商品コードと表示データをリセット
    setInputValue("");
    setProduct({ NAME: "", PRICE: "", CODE: "" });

    alert(`「${product.NAME}」を購入リストに追加しました。`);
  };

  // 購入処理
  const handlePurchase = async () => {
    if (purchaseList.length === 0) {
      alert("購入リストに商品がありません。");
      return;
    }
  
    // 合計金額計算
    const totalAmount = purchaseList.reduce((sum, item) => sum + (item.PRICE !== "-" ? parseInt(item.PRICE, 10) : 0), 0);
    const taxIncludedAmount = Math.round(totalAmount * 1.1); // 110%計算 (税込)
  
    // バックエンドにデータを送信
    try {
      const response = await fetch(`${API_URL}/api/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: purchaseList }),
      });

      if (!response.ok) throw new Error("購入データの送信に失敗しました。");
      alert(`購入完了！合計金額(税込): ${taxIncludedAmount}円`);

      // 入力データと購入リストをリセット
      setInputValue("");
      setProduct({ NAME: "", PRICE: "", CODE: "" });
      setPurchaseList([]);
    } catch (error) {
      alert("購入処理中にエラーが発生しました。");
    }
  };  

  return (
    <div style={{ display: "flex", marginLeft: "20px", marginTop: "50px" }}>
      {/* 左側エリア（入力・商品情報） */}
      <div>
        {/* 商品コードボックス */}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="商品コード13桁を入力"
          maxLength="13"
          style={{
            border: "2px solid black",
            padding: "10px",
            fontSize: "18px",
            width: "500px",
            textAlign: "center",
          }}
        />
        <br />

        {/* コード読込ボタン */}
        <button
          onClick={handleSearch}
          style={{
            border: "4px solid black",
            backgroundColor: "skyblue",
            color: "black",
            fontWeight: "bold",
            padding: "10px",
            fontSize: "18px",
            width: "500px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          コード読込み
        </button>

        {/* 商品名称表示エリア */}
        <div
          style={{
            border: "2px solid black",
            backgroundColor: product.NAME ? "white" : "lightgray",
            padding: "10px",
            fontSize: "18px",
            width: "500px",
            marginTop: "40px",
            textAlign: "center",
          }}
        >
          <p>{product.NAME || "商品名称"}</p>
        </div>

        {/* 単価表示エリア */}
        <div
          style={{
            border: "2px solid black",
            backgroundColor: product.PRICE ? "white" : "lightgray",
            padding: "10px",
            fontSize: "18px",
            width: "500px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <p>{product.PRICE !== "" ? `${product.PRICE}円` : "単価"}</p>
        </div>

        {/* 購入リスト追加ボタン */}
        <button
          onClick={handleAddToList}
          style={{
            border: "4px solid black",
            backgroundColor: "skyblue",
            color: "black",
            fontWeight: "bold",
            padding: "10px",
            fontSize: "18px",
            width: "500px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          購入リスト追加
        </button>
      </div>

      {/* 右側エリア（購入リスト） */}
      <div style={{ marginLeft: "40px" }}>
       <h2><b>購入リスト</b></h2>
       <div
         style={{
           border: "2px solid black",
           padding: "10px",
           fontSize: "18px",
           width: "500px",
           height: "250px",
           overflowY: "auto",
           textAlign: "left",
         }}
       >
         {purchaseList.length === 0 ? (
           <p>リストが空です</p>
         ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
             <thead>
               <tr>
                 <th style={{ borderBottom: "2px solid black" }}>商品名</th>
                 <th style={{ borderBottom: "2px solid black" }}>個数</th>
                 <th style={{ borderBottom: "2px solid black" }}>単価</th>
                 <th style={{ borderBottom: "2px solid black" }}>合計額</th>
               </tr>
             </thead>
             <tbody>
               {purchaseList.map((item, index) => (
                 <tr key={index}>
                   <td>{item.NAME}</td>
                   <td>{item.QUANTITY}</td>
                   <td>{item.PRICE}円</td>
                   <td>{item.TOTAL}円</td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </div>

        {/* 購入ボタン */}
        <button
          onClick={handlePurchase}
          style={{
            border: "4px solid black",
            backgroundColor: "skyblue",
            color: "black",
            fontWeight: "bold",
            padding: "10px",
            fontSize: "18px",
            width: "500px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          購入
        </button>
       </div>
      </div>
  );
}