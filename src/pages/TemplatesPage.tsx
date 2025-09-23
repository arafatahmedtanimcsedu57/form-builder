import React, { PropsWithChildren, useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  deleteTemplate,
  getAllTemplates,
} from "../redux/entities/formBuilderEntity";
import { getFromLocalStorage } from "../redux/common";

import NewFormDialogComponent from "../components/FormTemplates/NewFormDialogComponent";
import FormLayoutComponent from "../components/FormTemplates/FormLayoutComponent";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import { getAllClients } from "../redux/entities/clientsEntity";
import { TemplateType } from "../types/FormTemplateTypes";
import { GetAllTemplatesRequest } from "../types/ResponseFormTypes";
import Eye from "../assets/svg/Eye";
import { useNavigate } from "react-router-dom";
import Trash from "../assets/svg/Trash";
import Edit from "../assets/svg/Edit";

interface TemplatesPageProps {}

const TemplatesPage: React.FC<PropsWithChildren<TemplatesPageProps>> = ({}) => {
  const dispatch = useAppDispatch();
  const serverTemplates = useAppSelector(
    (state) => state.entities.formBuilder.allTemplates
  );
  const allTemplatesPagination = useAppSelector(
    (state) => state.entities.formBuilder.allTemplatesPagination
  );
  const clients = useAppSelector((state) => state.entities.client.allClients);
  const isLoading = useAppSelector(
    (state) => state.entities.formBuilder.isLoading
  );

  const authToken = useAppSelector((state) => state.user.access.token);

  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [page, setPage] = useState(0); // 0-indexed for API
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [localTemplates, setLocalTemplates] = useState<TemplateType[]>([]);
  const [searchFormName, setSearchFormName] = useState<string>("");
  const [searchFormId, setSearchFormId] = useState<string>("");

  useEffect(() => {
    if (authToken) {
      const request: GetAllTemplatesRequest = {
        page: page,
        size: rowsPerPage,
        formName: searchFormName,
        formId: searchFormId,
      };
      dispatch(getAllTemplates(request));
      dispatch(getAllClients("GET ALL CLIENTS"));

      const draftTemplates: TemplateType[] =
        JSON.parse(getFromLocalStorage("templates")) || [];
      setLocalTemplates(draftTemplates);
    }
  }, [authToken, page, rowsPerPage, searchFormName, searchFormId]);

  const handleSearch = () => {
    setPage(0); // Reset to first page on new search
    const request: GetAllTemplatesRequest = {
      page: 0,
      size: rowsPerPage,
      formName: searchFormName,
      formId: searchFormId,
    };
    dispatch(getAllTemplates(request));
  };

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value - 1); // Convert to 0-indexed for API
  };

  return (
    <div className="container-fluid">
      <div className=" container main-container">
        <div className="p-5 d-flex flex-column align-items-center gap-5">
          <div className="lighting-border px-5">
            <div className="px-5 py-4 text__welcome text-center ">
              <div className="">
                <span className="text-muted">Build</span>{" "}
                <span className="text-primary">beautiful forms</span>
              </div>
              <div className="pt-0 text-dark-emphasis">in seconds</div>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-5">
            {/* Create New */}
            <FormLayoutComponent
              template={null}
              createdFormLayout={false}
              setOpenDialog={setOpenDialog}
            />
            <div className="d-flex gap-3 align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder="Search by Form Name"
                value={searchFormName}
                onChange={(e) => setSearchFormName(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by Form ID"
                value={searchFormId}
                onChange={(e) => setSearchFormId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSearch}>
                Search
              </button>
            </div>

            {authToken ? (
              <>
                <div className="w-100 text-center">
                  <h6 className="text-primary">Single or multi-page forms</h6>
                  <h3 className="text-info-emphasis fw-bolder">
                    Discover our beautiful templates
                  </h3>
                  <div className="text-muted">
                    Our collection of beautiful templates to create your own
                    forms!
                  </div>
                </div>
                {isLoading ? (
                  <div className="w-100 text-center">
                    <p className="text-info-emphasis fw-bolder">
                      Data is cooking...
                    </p>
                  </div>
                ) : (
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Form Name</TableCell>
                          <TableCell align="right">Form ID</TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {serverTemplates.length ? (
                          serverTemplates.map((row) => (
                            <TableRow
                              key={row.id}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {row.formName}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                align="right"
                              >
                                {row.formId}
                              </TableCell>

                              <TableCell
                                component="th"
                                scope="row"
                                align="right"
                              >
                                <button
                                  type="button"
                                  className="btn btn-sm btn-info px-2 fw-medium"
                                  onClick={() =>
                                    navigate(
                                      `/formbuilder/${
                                        (row as TemplateType).publishStatus
                                      }-${(row as TemplateType).formId}`
                                    )
                                  }
                                >
                                  <Eye width="16" height="16" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {allTemplatesPagination &&
                  allTemplatesPagination.totalPages > 1 && (
                    <Stack spacing={2} sx={{ alignItems: "center", mt: 2 }}>
                      <Pagination
                        count={allTemplatesPagination.totalPages}
                        page={page + 1} // 1-indexed for UI
                        onChange={handleChangePage}
                        color="primary"
                      />
                    </Stack>
                  )}

                {localTemplates.length > 0 && (
                  <>
                    <div className="w-100 text-center mt-5">
                      <h3 className="text-info-emphasis fw-bolder">
                        Local Draft Templates
                      </h3>
                    </div>
                    <TableContainer component={Paper}>
                      <Table
                        sx={{ minWidth: 650 }}
                        aria-label="local templates table"
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>Form Name</TableCell>
                            <TableCell align="right">Form ID</TableCell>
                            <TableCell align="right"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {localTemplates.map((row) => (
                            <TableRow
                              key={row.id}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {row.formName}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                align="right"
                              >
                                {row.formId}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                align="right"
                              >
                                <div className="d-flex flex-row-reverse flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-warning px-2 fw-medium"
                                    onClick={() =>
                                      navigate(
                                        `/formbuilder/${
                                          (row as TemplateType).publishStatus
                                        }-${(row as TemplateType).formId}`
                                      )
                                    }
                                  >
                                    <Edit width="16" height="16" />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger px-2 fw-medium"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete the template?"
                                        )
                                      )
                                        dispatch(
                                          deleteTemplate(row?.id as string)
                                        );
                                    }}
                                  >
                                    <Trash width="16" height="16" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
            <hr />
            {authToken ? (
              <>
                <div className="w-100 text-center">
                  <h3 className="text-info-emphasis fw-bolder">
                    Trusted by the bests
                  </h3>
                </div>

                <div className="d-flex flex-wrap gap-5 justify-content-center w-100">
                  {clients.length ? (
                    clients.map((client) => {
                      return (
                        <div className="card p-4" style={{ width: "250px" }}>
                          <img
                            src={`${client.imageUrl}`}
                            className="card-img-top"
                            alt="..."
                          />
                          <div className="card-body d-flex flex-column align-items-start justify-content-between px-0">
                            <h6 className="card-title">{client.name}</h6>
                            <p className="card-text">{client.email}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <NewFormDialogComponent
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
        />
      </div>
    </div>
  );
};

export default TemplatesPage;
