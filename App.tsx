import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const customData = require('./items.json');

interface Item {
  id: string;
  productName: string;
  description: string;
  unitPrice: number;
  category: string;
  imageUrl: string;
}

interface CartItem extends Item {
  quantity: number;
}

const ShoppingStore: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filterItems, setFilterItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCart, setShowCart] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const categoryArray = ["groceries", "lifestyle", "cloths", "automotive", "gadgets", "furniture", "toys"]

  //Loads items and cart items if there is any
  useEffect(() => {
    loadItems();
    loadCartItems();
  }, []);

  // Save cart items to AsyncStorage
  useEffect(() => {
    saveCartItems();
  }, [cartItems]);

  /** <-- Start of Product and Cart Functions --> */

  const loadItems = async () => {
    setItems(customData);
  };

  const loadCartItems = async () => {
    const storedCartItems = await AsyncStorage.getItem('cartItems');
    const parsedCartItems = storedCartItems ? JSON.parse(storedCartItems) : [];
    setCartItems(parsedCartItems);
  };

  const saveCartItems = async () => {
    await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
  };

  const addItemToCart = (item: Item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      const updatedCartItems = cartItems.map((cartItem) =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      );
      setCartItems(updatedCartItems);
    } else {
      const newCartItem: CartItem = { ...item, quantity: 1 };
      setCartItems([...cartItems, newCartItem]);
    }
  };

  const removeItemFromCart = (itemId: string) => {
    const updatedCartItems = cartItems.map((cartItem) =>
      cartItem.id === itemId
        ? { ...cartItem, quantity: cartItem.quantity - 1 }
        : cartItem
    );
    setCartItems(updatedCartItems.filter((cartItem) => cartItem.quantity > 0));
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  };

  /** <-- End of Product and Cart Functions --> */

  /** <-- Start of Filter Functions --> */

  const filterItemsByCategory = (category: string) => {
    setSelectedCategory(category);
    const filteredItems = category
      ? items.filter((item) => item.category === category)
      : items;
    setFilterItems(filteredItems);
  };

  const sortItemsByPrice = () => {
    const sortedItems = [...items].sort((a, b) =>
      sortOrder === 'asc' ? a.unitPrice - b.unitPrice : b.unitPrice - a.unitPrice
    );
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setItems(sortedItems);
  };

  const sortFilterItemsbyPrice = () => {
    const sortedItems = [...filterItems].sort((a, b) =>
      sortOrder === 'asc' ? a.unitPrice - b.unitPrice : b.unitPrice - a.unitPrice
    );
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setFilterItems(sortedItems);
  };

  const searchFilteredItems = (keyword: string) => {
    if (keyword === '') onPressClearFilters()
    setSearchKeyword(keyword);
    const filteredItems = items.filter((item) =>
      item.productName.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilterItems(filteredItems);
  };

  const searchItems = (keyword: string) => {
    if (keyword === '') onPressClearFilters()
    setSearchKeyword(keyword);
    const filteredItems = items.filter((item) =>
      item.productName.toLowerCase().includes(keyword.toLowerCase())
    );
    setItems(filteredItems);
  };


  /** <-- End of Filter Functions --> */

  /** <-- Start of OnPress Functions --> */

  const onPressClearCart = () => {
    setCartItems([]);
  };

  const onPressShowCart = () => {
    setShowCart((current) => !current)
  };

  const onPressCheckOut = () => {
    if (cartItems.length === 0) return
    setModalVisible(true);
    onPressClearCart();
  };

  const onPressClearFilters = () => {
    filterItemsByCategory('')
    setSearchKeyword('')
    setItems(customData);
  };

  /** <-- End of OnPress Functions --> */

  const renderItem = ({ item }: { item: Item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginHorizontal: 10, backgroundColor: '#b8d8d8', padding: 10, borderRadius: 10 }}>
      {
        item.imageUrl ?
          <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80, marginRight: 10, borderRadius: 8, overflow: 'hidden' }} />
          : null
      }

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{item.productName}</Text>
        <Text numberOfLines={4} style={{ fontSize: 10, color: 'gray', textAlign: 'left', marginRight: 10 }}>{item.description}</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>${item.unitPrice.toFixed(2)}</Text>
      </View>

      <TouchableOpacity onPress={() => addItemToCart(item)}>
        <Text style={{ fontSize: 30, color: '#fe5f55', margin: 5 }}>🛒</Text>
        <Text style={{ fontSize: 15, color: '#fe5f55', margin: 5, position: 'absolute', left: -5 }}>➕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginHorizontal: 10, backgroundColor: '#b8d8d8', padding: 10, borderRadius: 10 }}>
      {
        item.imageUrl ?
          <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80, marginRight: 10, borderRadius: 8, overflow: 'hidden' }} />
          : null
      }

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{item.productName}</Text>
        <Text numberOfLines={4} style={{ fontSize: 10, color: 'gray', textAlign: 'left', marginRight: 10 }}>{item.description}</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 5 }}>
          ${item.unitPrice} x {item.quantity} = ${(item.unitPrice * item.quantity).toFixed(2)}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            borderColor: 'black',
            borderWidth: 1,
            width: 25,
            height: 25,
            borderRadius: 30 / 2,
            justifyContent: 'center'
          }}
          onPress={() => addItemToCart(item)}>
          <Text style={{ fontSize: 10, color: 'black', textAlign: 'center' }}>➕</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, marginHorizontal: 5 }}>{item.quantity}</Text>
        <TouchableOpacity
          style={{
            borderColor: 'black',
            borderWidth: 1,
            width: 25,
            height: 25,
            borderRadius: 30 / 2,
            justifyContent: 'center'
          }}
          onPress={() => removeItemFromCart(item.id)}>
          <Text style={{ fontSize: 10, color: 'black', textAlign: 'center' }}>➖</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#eef5db' }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
          <TouchableOpacity disabled={!showCart} style={{ flexDirection: 'row' }} onPress={onPressShowCart}>
            {showCart ? <Text style={{ color: 'black', fontSize: 30, margin: 10, textAlign: 'center', alignSelf: 'center' }}>◀</Text> : null}
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, marginHorizontal: showCart ? -5 : 10, alignSelf: 'center', textAlign: 'center' }}>
              {!showCart ? 'Available Items' : 'My Cart'}
            </Text>
          </TouchableOpacity>
          {showCart ?
            <TouchableOpacity onPress={onPressClearCart}>
              <Text style={{ color: 'black', fontSize: 30, margin: 10, textAlign: 'center', alignSelf: 'center' }}>🗑️</Text>
            </TouchableOpacity>
            : null}
          {showCart || selectedCategory === '' ? null :
            <TouchableOpacity onPress={onPressClearFilters}>
              <Text style={{ color: 'gray', fontSize: 20, margin: 10, textAlign: 'center', alignSelf: 'center' }}>❌</Text>
            </TouchableOpacity>}
        </View>
        {
          showCart ? null :
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderWidth: 0.5 }}>
                <ScrollView horizontal style={{ flexDirection: 'row' }}>
                  {
                    categoryArray.map((item) => {
                      return <TouchableOpacity
                        key={item}
                        style={{ padding: 10, marginHorizontal: 10, marginVertical: 5 }}
                        onPress={() => filterItemsByCategory(item)}>
                        <Text style={{ color: selectedCategory === item ? '#FE5F55' : 'gray', fontSize: 16 }}>{item.slice(0, 1).toUpperCase() + item.slice(1, item.length)}</Text>
                      </TouchableOpacity>
                    })
                  }
                </ScrollView>
              </View>
              {
                < TextInput
                  style={styles.input}
                  placeholder="Search by Product Name"
                  onChangeText={selectedCategory === '' ? searchItems : searchFilteredItems}
                  value={searchKeyword}
                />
              }
              <TouchableOpacity style={{ margin: 5, marginLeft: 15 }} onPress={selectedCategory === '' ? sortItemsByPrice : sortFilterItemsbyPrice}>
                <Text style={{ color: 'gray' }}>Sort by Price {sortOrder === 'asc' ? '▲' : '▼'}</Text>
              </TouchableOpacity>
            </>
        }
        {
          !showCart ?
            <FlatList
              style={{ marginTop: 10 }}
              data={selectedCategory === '' ? items : filterItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
            :
            <FlatList
              inverted
              style={{ marginTop: 10 }}
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
            />}
      </View>

      {
        showCart ?
          <View style={{ marginTop: 10, marginHorizontal: 15 }}>
            <Text style={{ fontSize: 16 }}>Total Items: {getTotalItems()}</Text>
            <Text style={{ fontSize: 16 }}>Total Amount: ${getTotalAmount().toFixed(2)}</Text>
          </View>
          : null
      }

      {showCart ?
        <TouchableOpacity style={{ backgroundColor: '#fe5f55', margin: 10, borderRadius: 8 }} onPress={onPressCheckOut}>
          <Text style={{ color: 'black', fontSize: 20, margin: 10, textAlign: 'center', alignSelf: 'center' }}>Checkout</Text>
        </TouchableOpacity>
        : null}

      {
        !showCart ?
          <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={onPressShowCart}>
              <Text style={{ fontSize: 25 }}>🛒</Text>
            </TouchableOpacity>
          </View>
          : null
      }

      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Thank you for purchasing!</Text>
          <TouchableOpacity style={{ backgroundColor: '#fe5f55', margin: 10, borderRadius: 8 }} onPress={() => (onPressShowCart(), setModalVisible(false))}>
            <Text style={{ color: 'black', fontSize: 20, margin: 10, textAlign: 'center', alignSelf: 'center' }}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ShoppingStore;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#ffbf69',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderColor: 'gray',
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    marginTop: -10
  }
});