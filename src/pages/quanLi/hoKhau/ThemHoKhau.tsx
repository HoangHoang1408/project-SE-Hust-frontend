import { XIcon } from "@heroicons/react/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { cloneDeep } from "lodash";
import { FC, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { VaiTroThanhVienDisplay } from "../../../common/constants";
import { FormInput } from "../../../components/form/FormInput";
import LoadingButton from "../../../components/form/LoadingButton";
import {
  useDanhSachNguoiDungLazyQuery,
  UserFragmentFragment,
  useThemHoKhauMutation,
  VaiTroThanhVien,
} from "../../../graphql/generated/schema";
import { loadingWhite } from "../../../images";
import { getApolloErrorMessage } from "../../../utils/getApolloErrorMessage";

type Props = {
  setThanhVien: (thanhvien: UserFragmentFragment) => void;
};

const SearchThanhVienInputs: FC<Props> = ({ setThanhVien }) => {
  const [canCuocCongDan, setCanCuocCongDan] = useState<string>("");
  const [getUsers, { loading }] = useDanhSachNguoiDungLazyQuery();
  const [results, setResults] = useState<UserFragmentFragment[]>([]);
  const [canShowResults, setCanShowResults] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // @ts-ignore
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setCanShowResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [ref]);
  useEffect(() => {
    if (canCuocCongDan.length === 0) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      getUsers({
        variables: {
          input: {
            canCuocCongDan,
            paginationInput: {
              page: 1,
              resultsPerPage: 10,
            },
          },
        },
        onCompleted: (data) => {
          setResults(data.xemDanhSachNguoiDung.users || []);
        },
        onError: (error) => {
          const msg = getApolloErrorMessage(error);
          if (msg) {
            toast.error(msg);
            return;
          }
          toast.error("L???i x???y ra, vui l??ng th??? l???i sau");
        },
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [canCuocCongDan]);

  return (
    <div className="flex flex-col grid-rows-2 space-y-3 mx-1 mb-2 p-3 rounded border border-indigo-500">
      <div className="flex flex-col space-y-2 relative">
        <label htmlFor="" className="text-indigo-700 font-semibold">
          T??m theo c??n c?????c c??ng d??n
        </label>
        <div ref={ref}>
          <input
            className="appearance-none block w-full h-8 px-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            type="text"
            value={canCuocCongDan}
            onChange={(e) => setCanCuocCongDan(e.target.value)}
            onFocus={() => setCanShowResults(true)}
          />
          <div className="absolute top-full left-0 w-full flex flex-col space-y-1 rounded-md shadow-md bg-gray-200 z-10">
            {loading && (
              <img className="w-32 h-32 mx-auto" src={loadingWhite}></img>
            )}
            {canShowResults && results.length === 0 && !loading && (
              <h1 className="text-center py-4 bg-white">
                Nh???p c??n c?????c c??ng d??n ????ng ????? t??m
              </h1>
            )}
            {canShowResults &&
              results.length > 0 &&
              results.map(({ ten, canCuocCongDan }, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setThanhVien(results[i]);
                      setCanShowResults(false);
                      setCanCuocCongDan("");
                    }}
                    className="flex flex-col p-2 bg-white border border-indigo-500 rounded-md m-1 cursor-pointer hover:bg-indigo-500 hover:text-white"
                  >
                    <h1>H??? t??n: {ten}</h1>
                    <h1>C??n c?????c c??ng d??n: {canCuocCongDan}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemHoKhau: FC = () => {
  const navigate = useNavigate();
  const [thanhVien, setThanhVien] = useState<
    { user: UserFragmentFragment; vaiTro: VaiTroThanhVien | null }[]
  >([]);
  const [nguoiYeuCau, setNguoiYeuCau] = useState<UserFragmentFragment>();
  const [themHoKhau, { loading }] = useThemHoKhauMutation();
  const {
    register,
    formState: { errors },
    getValues,
    reset,
    handleSubmit,
  } = useForm<{
    diaChi: string;
  }>({
    mode: "onBlur",
    resolver: yupResolver(
      yup.object().shape({
        diaChi: yup.string().required("Vui l??ng nh???p ?????a ch???"),
      })
    ),
  });
  const submitHandler = async () => {
    if (thanhVien.length === 0) {
      toast.error("Vui l??ng th??m th??nh vi??n");
      return;
    }
    if (!nguoiYeuCau) {
      toast.error("Vui l??ng nh???p ng?????i y??u c???u");
      return;
    }
    const allHaveVaiTro = thanhVien.every((tv) => tv.vaiTro);
    if (!allHaveVaiTro) {
      toast.error("Vui l??ng ch???n vai tr?? cho t???t c??? th??nh vi??n");
      return;
    }
    themHoKhau({
      variables: {
        input: {
          thanhVien: thanhVien.map((tv) => ({
            id: tv.user.id,
            vaiTroThanhVien: tv.vaiTro!,
          })),
          nguoiYeuCauId: nguoiYeuCau?.id,
          diaChiThuongTru: getValues("diaChi"),
        },
      },
      onCompleted: (data) => {
        if (data.themHoKhau.ok) {
          toast.success("Th??m h??? kh???u th??nh c??ng");
          setThanhVien([]);
          setNguoiYeuCau(undefined);
          reset();
          return;
        }
        const msg = data.themHoKhau.error?.message;
        if (msg) {
          toast.error(msg);
          return;
        }
      },
      onError: (error) => {
        const msg = getApolloErrorMessage(error);
        if (msg) {
          toast.error(msg);
          return;
        }
        toast.error("L???i x???y ra, vui l??ng th??? l???i sau");
      },
    });
  };
  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-8 pl-12 pr-16 pt-12 pb-16 "
    >
      <div className="flex flex-col col-span-1">
        <h3 className="leading-6 font-semibold text-gray-900 text-3xl mb-8">
          Th??m h??? kh???u
        </h3>
        <div className="grid grid-cols-2 gap-x-6">
          <div className="rounded-md shadow-md p-3 col-span-1 h-fit">
            <h1 className="text-xl mb-2 font-semibold text-indigo-700">
              Th??nh vi??n trong h??? kh???u
            </h1>
            <SearchThanhVienInputs
              setThanhVien={(thanhVien: UserFragmentFragment) =>
                setThanhVien((pre) => {
                  const temp = cloneDeep(pre);
                  const alreadyAdded = temp.some(
                    (tv) => tv.user.id === thanhVien.id
                  );
                  if (alreadyAdded) {
                    toast.error("Th??nh vi??n ???? ???????c th??m");
                    return temp;
                  }
                  temp.push({
                    user: thanhVien,
                    vaiTro: null,
                  });
                  return temp;
                })
              }
            />
            <h1 className="text-lg font-semibold text-indigo-700 mb-1">
              Danh s??ch
            </h1>
            {thanhVien.length > 0 && (
              <div className="flex flex-col space-y-2 border border-indigo-500 rounded-md divide-y divide-indigo-300 ">
                {thanhVien.map(({ user: { ten, canCuocCongDan } }, i) => {
                  return (
                    <div
                      key={i}
                      className="flex flex-col p-2 bg-white m-1 relative"
                    >
                      <div className="absolute top-2 right-1 w-fit h-fit bg-red-500 rounded-full flex items-center justify-center cursor-pointer">
                        <XIcon
                          onClick={() => {
                            setThanhVien((pre) => {
                              const temp = cloneDeep(pre);
                              temp.splice(i, 1);
                              return temp;
                            });
                          }}
                          className="w-5 h-5 text-white cursor-pointer"
                        />
                      </div>
                      <h1
                        className="
                      text-lg font-semibold text-indigo-700 mb-1
                      "
                      >
                        Th??nh vi??n th??? {i + 1}:
                      </h1>
                      <div className="px-2 flex flex-col space-y-1">
                        <h1>H??? t??n: {ten}</h1>
                        <h1>C??n c?????c c??ng d??n: {canCuocCongDan}</h1>
                        <div className="flex items-center space-x-3">
                          <label className="w-fit">Quan h??? v???i ch??? h???:</label>
                          <select
                            className="appearance-none block h-8 px-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium w-fit"
                            onChange={(e) => {
                              setThanhVien((pre) => {
                                const temp = cloneDeep(pre);
                                // @ts-ignore
                                temp[i].vaiTro = e.target.value;
                                return temp;
                              });
                            }}
                            value={thanhVien[i].vaiTro || "Null"}
                          >
                            <option value="Null">Null</option>
                            {Object.entries(VaiTroThanhVienDisplay).map((v) => {
                              return (
                                <option key={v[0]} value={v[0]}>
                                  {v[1]}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-md shadow-md p-3 col-span-1 h-fit flex flex-col space-y-4">
            <div>
              <h1 className="text-xl mb-2 font-semibold text-indigo-700">
                Ng?????i y??u c???u
              </h1>
              <SearchThanhVienInputs
                setThanhVien={(nguoiYeuCau: UserFragmentFragment) =>
                  setNguoiYeuCau(nguoiYeuCau)
                }
              />
              {nguoiYeuCau && (
                <div className="mx-1 px-3 py-2 flex flex-col border border-indigo-500 rounded-md">
                  <h1>H??? t??n: {nguoiYeuCau.ten}</h1>
                  <h1>C??n c?????c c??ng d??n: {nguoiYeuCau.canCuocCongDan}</h1>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-3">
              <label className="text-xl font-semibold text-indigo-700 -mb-2">
                ?????a ch???
              </label>
              <div className="px-1">
                <FormInput
                  id="diaChi"
                  registerReturn={register("diaChi", { required: true })}
                  type="text"
                  errorMessage={errors.diaChi && "?????a ch??? kh??ng ???????c ????? tr???ng"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-5 flex justify-end space-x-3">
        <button
          onClick={() => navigate("/manager/hoKhau")}
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Hu???
        </button>
        <LoadingButton loading={loading} text="Th??m" className="w-fit" />
      </div>
    </form>
  );
};
export default ThemHoKhau;
