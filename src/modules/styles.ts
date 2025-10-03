
export const modalStyles = `
  .modal {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    padding: 20px;
    width: 200px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    user-select: none;
    position: relative;
  }

  .modal h4 {
      font-family: "Roboto", "Helvetica", sans-serif;
      margin: 0 0 15px;
      font-size: 18px;
      color: #333;
      display: inline;
      vertical-align: middle;
  }

  .audio-spectrum {
    width: 100%;
    height: 30px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }

  .modal button {
    margin-top: 5px;
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .modal button:hover {
    background-color: #0056b3;
  }

  .copy-button {
    margin-top: 10px !important;
    padding: 5px 15px !important;
    font-size: 14px !important;
    background-color: #28a745 !important;
    color: white !important;
    border: none !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    transition: background-color 0.3s ease !important;
  }

  .copy-button:hover {
    background-color: #218838 !important;
  }

  .retry-button {
    margin-top: 10px !important;
    padding: 8px 15px !important;
    font-size: 14px !important;
    background-color: #ff6b35 !important;
    color: white !important;
    border: none !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    transition: background-color 0.3s ease !important;
  }

  .retry-button:hover {
    background-color: #e55a2b !important;
  }

  .close-btn {
    position: absolute;
    top: 7px;
    right: 12px;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 14px;
    color: #888;
    transition: color 0.2s ease;
  }

  input[type="text"] {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    background-color: #fff;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.3s ease;
  }

  input[type="text"]::placeholder {
    color: #888;
  }

  input[type="text"]:focus {
    border-color: #007bff;
  }

  .botao-mic {
    cursor: pointer;
    margin-top: 15px !important;
    border-radius: 50% !important;
    transition: transform 0.2s ease;
    display: block;
    margin: 0 auto;
  }

  .output {
    margin-top: 10px;
    font-size: 14px;
    color: #333;
    white-space: pre-wrap;
  }

  .spinner {
    margin: 10px auto;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }

  .settings-icon {
      background: none !important;
      border: none;
      cursor: pointer;
      position: relative;
      display: inline-block;
      margin-left: 8px;
      vertical-align: middle;
    }

    .settings-icon svg {
      width: 24px;
      height: 24px;
      stroke: #888;
      transition: stroke 0.2s ease;
    }

    .settings-icon:hover svg {
      stroke: #333;
    }

    .settings-modal {
      display: none;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      padding: 20px;
      width: 200px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      position: absolute;
      top: 50px;
      right: 0;
      z-index: 10001;
    }

    .settings-modal.show {
      display: block;
    }

    .settings-modal h4 {
      margin-top: 0;
    }

    .settings-modal button.close-settings {
      position: absolute;
      top: 7px;
      right: 12px;
      background: none;
      border: none;
      font-size: 14px;
      color: #888;
      cursor: pointer;
    }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
