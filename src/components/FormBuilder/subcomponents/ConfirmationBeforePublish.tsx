import React, { Component } from "react";
import ReactJson from "react-json-view";
import axios from "axios";

import {
  FormLayoutComponentsType,
  TemplateType,
} from "../../../types/FormTemplateTypes";
import { convert } from "../../../utils/convert";

interface ConfirmationBeforePublishPropsType {
  formLayoutComponents: FormLayoutComponentsType[];
  template: TemplateType;
}

class ConfirmationBeforePublish extends Component<
  ConfirmationBeforePublishPropsType,
  any
> {
  constructor(props: ConfirmationBeforePublishPropsType) {
    super(props);
    this.state = {
      file: null,
      ...ConfirmationBeforePublish.defaultProps,
      src: JSON.parse(
        JSON.stringify({
          formName: this.props.template?.formName,
          blocks: [...convert(this.props.formLayoutComponents).blocks],
        }),
      ),
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static defaultProps = {
    theme: "monokai",
    src: null,
    collapsed: false,
    collapseStringsAfter: 15,
    onAdd: true,
    onEdit: true,
    onDelete: true,
    displayObjectSize: true,
    enableClipboard: true,
    indentWidth: 4,
    displayDataTypes: true,
    iconStyle: "triangle",
  };

  handleChange(event: any) {
    this.setState({ file: event.target.files[0] });
  }

  handleSubmit(event: any) {
    event.preventDefault();

    let data = new FormData();
    data.append("file", this.state.file);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://stg-digireg-b.allevia.md/api/multimedia/upload-file",
      headers: {
        "content-type": "multipart/form-data",
      },
      data: data,
    };
    axios.request(config).then((response) => {
      const _data = JSON.parse(JSON.stringify(this.state.src));
      _data.pdf = { ...response.data };
      this.setState({ src: { ..._data } });
    });
  }

  render() {
    const {
      src,
      collapseStringsAfter,
      onAdd,
      onEdit,
      onDelete,
      displayObjectSize,
      enableClipboard,
      theme,
      iconStyle,
      collapsed,
      indentWidth,
      displayDataTypes,
    } = this.state;

    const style = {
      padding: "10px",
      borderRadius: "3px",
      margin: "10px 0px",
    };

    return (
      <>
        <div>
          <div
            style={{
              minWidth: "30vw",
              backgroundColor: "#f8f9fa",
              height: "100vh",
            }}
          >
            <div className="p-4 container">
              <form className="btn-group" onSubmit={this.handleSubmit}>
                <input
                  className="form-control btn border"
                  type="file"
                  onChange={this.handleChange}
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-outline-primary fw-medium px-4"
                >
                  Upload
                </button>
              </form>
              <hr />

              <ReactJson
                name={false}
                collapsed={collapsed}
                style={style}
                theme={theme}
                src={src}
                collapseStringsAfterLength={collapseStringsAfter}
                onEdit={
                  onEdit
                    ? (e) => {
                        console.log(e);
                        this.setState({ src: e.updated_src });
                      }
                    : false
                }
                onDelete={
                  onDelete
                    ? (e) => {
                        console.log(e);
                        this.setState({ src: e.updated_src });
                      }
                    : false
                }
                onAdd={
                  onAdd
                    ? (e) => {
                        console.log(e);
                        this.setState({ src: e.updated_src });
                      }
                    : false
                }
                displayObjectSize={displayObjectSize}
                enableClipboard={enableClipboard}
                indentWidth={indentWidth}
                displayDataTypes={displayDataTypes}
                iconStyle={iconStyle}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ConfirmationBeforePublish;
