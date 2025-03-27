import React, { useState, useEffect } from "react";
import { Text, TextInput, View, Button, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Definindo o tipo para a despesa
interface Despesa {
  id: string;
  descricao: string;
  valor: string;
}

const Index: React.FC = () => {
  const [descricao, setDescricao] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [despesas, setDespesas] = useState<Despesa[]>([]); // Estado para armazenar as despesas

  // Função para carregar as despesas do AsyncStorage
  const carregarDespesas = async () => {
    try {
      const despesasSalvas = await AsyncStorage.getItem("despesas");
      if (despesasSalvas) {
        setDespesas(JSON.parse(despesasSalvas)); // Carregar as despesas salvas
      }
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    }
  };

  // Função para salvar as despesas no AsyncStorage
  const salvarDespesas = async (novasDespesas: Despesa[]) => {
    try {
      await AsyncStorage.setItem("despesas", JSON.stringify(novasDespesas));
    } catch (error) {
      console.error("Erro ao salvar despesas:", error);
    }
  };

  // Função para adicionar despesa
  const adicionarDespesa = () => {
    if (descricao && valor) {
      const novaDespesa: Despesa = { id: Date.now().toString(), descricao, valor };

      // Atualizando o estado com a nova despesa
      const novasDespesas = [...despesas, novaDespesa];
      setDespesas(novasDespesas);

      // Salvando as despesas no AsyncStorage
      salvarDespesas(novasDespesas);

      // Limpando os campos após adicionar a despesa
      setDescricao("");
      setValor("");
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  // Função para remover despesa
  const removerDespesa = (id: string) => {
    const novasDespesas = despesas.filter((despesa) => despesa.id !== id);
    setDespesas(novasDespesas);
    salvarDespesas(novasDespesas); // Atualizar AsyncStorage
  };

  // Carregar as despesas ao montar o componente
  useEffect(() => {
    carregarDespesas();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despesas</Text>

      {/* Campo de descrição */}
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={descricao}
        onChangeText={(text) => setDescricao(text)}
      />

      {/* Campo de valor */}
      <TextInput
        style={styles.input}
        placeholder="Valor"
        keyboardType="numeric"
        value={valor}
        onChangeText={(text) => setValor(text)}
      />

      {/* Botão para adicionar a despesa */}
      <Button title="Adicionar Despesa" onPress={adicionarDespesa} />

      {/* Lista de despesas */}
      <FlatList
        data={despesas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.descricao}</Text>
            <Text style={styles.cardValue}>R$ {item.valor}</Text>

            {/* Botão de remoção */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removerDespesa(item.id)}
            >
              <Text style={styles.removeButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8", // Cor de fundo
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Adiciona sombra no Android
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: 16,
    marginTop: 5,
    color: "#888",
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: "#ff5c5c",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Index;
